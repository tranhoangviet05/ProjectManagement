<?php

namespace App\Services;

use App\Enums\ProviderStatus;
use App\Enums\ServiceStatus;
use App\Models\Booking;
use App\Models\Coupon;
use App\Models\HotelRoomType;
use App\Models\Service;
use App\Models\ServiceAvailability;
use App\Models\ServicePromotion;
use App\Models\User;
use App\Models\UserCoupon;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BookingService
{
    /**
     * Thời gian giữ chỗ chờ thanh toán online (phút).
     */
    public const PAYMENT_HOLD_MINUTES = 10;

    /**
     * Các trạng thái đơn đang chiếm giữ slot/phòng trên hệ thống.
     */
    public const ACTIVE_BOOKING_STATUSES = [
        'pending_payment',
        'confirmed',
        'checked_in',
    ];

    /**
     * Tự động hủy các đơn chờ thanh toán quá 10 phút và trả lại slot vào service_availability.
     */
    public function expireStaleHolds(?int $serviceId = null): int
    {
        $query = Booking::query()
            ->where('status', 'pending_payment')
            ->whereNotNull('payment_expires_at')
            ->where('payment_expires_at', '<', now());

        if ($serviceId !== null) {
            $query->where('service_id', $serviceId);
        }

        $expiredIds = $query->pluck('id');
        if ($expiredIds->isEmpty()) {
            return 0;
        }

        $count = 0;
        foreach ($expiredIds as $bookingId) {
            DB::transaction(function () use ($bookingId, &$count) {
                $locked = Booking::where('id', $bookingId)->lockForUpdate()->first();
                if (! $locked || $locked->status !== 'pending_payment') {
                    return;
                }
                if ($locked->payment_expires_at && $locked->payment_expires_at->isFuture()) {
                    return;
                }

                $this->restoreAvailabilityForBooking($locked);

                $locked->update([
                    'status' => 'cancelled',
                    'cancel_reason' => 'Chưa thanh toán',
                    'cancelled_at' => now(),
                ]);
                $count++;
            });
        }

        return $count;
    }

    /**
     * Xem trước bảng giá, tỷ lệ cọc (0% / 30% / 100%) và kiểm tra xung đột lịch.
     *
     * @return array<string, mixed>
     */
    public function preview(?User $user, array $data): array
    {
        $serviceId = (int) $data['service_id'];
        $this->expireStaleHolds($serviceId);

        $service = $this->loadBookableService($serviceId);
        $startDate = Carbon::parse($data['start_date'])->startOfDay();
        $endDate = ! empty($data['end_date'])
            ? Carbon::parse($data['end_date'])->startOfDay()
            : null;

        $this->validateDatesForService($service, $startDate, $endDate);

        $roomType = $this->resolveRoomType($service, $data['room_type_id'] ?? null);
        $quantity = max(1, (int) ($data['quantity'] ?? 1));
        $metadata = is_array($data['metadata'] ?? null) ? $data['metadata'] : [];

        $dates = $this->resolveRequestedDates($service, $startDate, $endDate);
        $durationUnits = count($dates);

        $availabilityRecords = ServiceAvailability::query()
            ->where('service_id', $service->id)
            ->whereIn('available_date', $dates)
            ->get()
            ->keyBy(fn (ServiceAvailability $row) => $row->available_date->format('Y-m-d'));

        $this->assertScheduleAvailable(
            $service,
            $roomType,
            $dates,
            $startDate,
            $endDate,
            $quantity,
            $metadata,
            $availabilityRecords
        );

        $pricing = $this->calculatePricing(
            $user,
            $service,
            $roomType,
            $dates,
            $quantity,
            $availabilityRecords,
            $data['coupon_code'] ?? null,
            $data['deposit_rate'] ?? null
        );

        return array_merge($pricing, [
            'service_id' => $service->id,
            'room_type_id' => $roomType?->id,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate?->format('Y-m-d'),
            'quantity' => $quantity,
            'duration_units' => $durationUnits,
            'payment_hold_minutes' => $pricing['deposit_amount'] > 0 ? self::PAYMENT_HOLD_MINUTES : 0,
            'availability_ok' => true,
        ]);
    }

    /**
     * Tạo đơn đặt chỗ (hỗ trợ cả khách đã đăng nhập & khách vãng lai), giữ chỗ 10 phút nếu cần thanh toán online.
     */
    public function createBooking(?User $user, array $data): Booking
    {
        $serviceId = (int) $data['service_id'];
        $this->expireStaleHolds($serviceId);

        return DB::transaction(function () use ($user, $data, $serviceId) {
            $service = $this->loadBookableService($serviceId);
            $startDate = Carbon::parse($data['start_date'])->startOfDay();
            $endDate = ! empty($data['end_date'])
                ? Carbon::parse($data['end_date'])->startOfDay()
                : null;

            $this->validateDatesForService($service, $startDate, $endDate);

            $isStay = in_array($service->type, ['hotel', 'homestay'], true);
            $roomType = null;
            if (! empty($data['room_type_id'])) {
                $roomType = HotelRoomType::query()
                    ->where('id', (int) $data['room_type_id'])
                    ->where('service_id', $service->id)
                    ->where('status', 'active')
                    ->lockForUpdate()
                    ->first();

                if (! $roomType) {
                    throw ValidationException::withMessages([
                        'room_type_id' => ['Hạng phòng được chọn không tồn tại hoặc đang tạm ngưng.'],
                    ]);
                }
            } elseif ($isStay) {
                $roomType = HotelRoomType::query()
                    ->where('service_id', $service->id)
                    ->where('status', 'active')
                    ->orderBy('base_price')
                    ->lockForUpdate()
                    ->first();
            }

            $quantity = max(1, (int) ($data['quantity'] ?? 1));
            $metadata = is_array($data['metadata'] ?? null) ? $data['metadata'] : [];

            $dates = $this->resolveRequestedDates($service, $startDate, $endDate);
            $durationUnits = count($dates);

            $availabilityRecords = ServiceAvailability::query()
                ->where('service_id', $service->id)
                ->whereIn('available_date', $dates)
                ->lockForUpdate()
                ->get()
                ->keyBy(fn (ServiceAvailability $row) => $row->available_date->format('Y-m-d'));

            $this->assertScheduleAvailable(
                $service,
                $roomType,
                $dates,
                $startDate,
                $endDate,
                $quantity,
                $metadata,
                $availabilityRecords
            );

            $pricing = $this->calculatePricing(
                $user,
                $service,
                $roomType,
                $dates,
                $quantity,
                $availabilityRecords,
                $data['coupon_code'] ?? null,
                $data['deposit_rate'] ?? null,
                true
            );

            $requiresOnlinePayment = $pricing['deposit_amount'] > 0;
            $initialStatus = $requiresOnlinePayment ? 'pending_payment' : 'confirmed';
            $paymentExpiresAt = $requiresOnlinePayment ? now()->addMinutes(self::PAYMENT_HOLD_MINUTES) : null;

            $booking = Booking::create([
                'booking_code' => $this->generateBookingCode(),
                'qr_checkin_token' => hash('sha256', Str::uuid()->toString().'|'.($user?->id ?? 'guest').'|'.microtime(true)),
                'user_id' => $user?->id,
                'service_id' => $service->id,
                'provider_id' => $service->provider_id,
                'room_type_id' => $roomType?->id,
                'service_promotion_id' => $pricing['service_promotion_id'],
                'coupon_id' => $pricing['coupon_id'],
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate?->format('Y-m-d'),
                'quantity' => $quantity,
                'duration_units' => $durationUnits,
                'unit_price' => $pricing['unit_price'],
                'subtotal' => $pricing['subtotal'],
                'promotion_discount_amount' => $pricing['promotion_discount_amount'],
                'coupon_discount_amount' => $pricing['coupon_discount_amount'],
                'total_amount' => $pricing['total_amount'],
                'deposit_rate' => $pricing['deposit_rate'],
                'deposit_amount' => $pricing['deposit_amount'],
                'remaining_amount' => $pricing['remaining_amount'],
                'status' => $initialStatus,
                'payment_expires_at' => $paymentExpiresAt,
                'contact_name' => trim((string) ($data['contact_name'] ?? $user?->name ?? 'Khách hàng')),
                'contact_phone' => trim((string) ($data['contact_phone'] ?? $user?->phone ?? '')),
                'contact_email' => trim((string) ($data['contact_email'] ?? $user?->email ?? '')) ?: null,
                'special_requests' => $data['special_requests'] ?? null,
                'metadata' => ! empty($metadata) ? $metadata : null,
            ]);

            // Giữ chỗ ngay lập tức trong service_availability
            foreach ($dates as $dateStr) {
                $row = $availabilityRecords->get($dateStr);
                if ($row) {
                    $row->increment('booked_slots', $quantity);
                }
            }

            if ($pricing['coupon_id']) {
                Coupon::where('id', $pricing['coupon_id'])->increment('used_count');
                if ($user) {
                    UserCoupon::where('coupon_id', $pricing['coupon_id'])
                        ->where('user_id', $user->id)
                        ->whereNull('used_at')
                        ->update(['used_at' => now()]);
                }
            }

            return $booking->fresh([
                'service.media',
                'service.location',
                'service.policies',
                'provider:id,business_name,phone,address',
                'roomType:id,name,rank,base_price',
                'servicePromotion.holidayCampaign',
                'coupon:id,code,type,discount_value',
            ]);
        });
    }

    /**
     * Hủy đơn đặt chỗ và hoàn trả lại slot đã giữ trong service_availability.
     */
    public function cancelBooking(User $user, Booking $booking, ?string $reason = null): Booking
    {
        if ((int) $booking->user_id !== (int) $user->id) {
            abort(403, 'Bạn không có quyền hủy đơn đặt chỗ này.');
        }

        if (! in_array($booking->status, ['pending_payment', 'confirmed'], true)) {
            throw ValidationException::withMessages([
                'status' => ['Không thể hủy đơn ở trạng thái hiện tại.'],
            ]);
        }

        return DB::transaction(function () use ($booking, $reason) {
            $locked = Booking::where('id', $booking->id)->lockForUpdate()->firstOrFail();

            if (! in_array($locked->status, ['pending_payment', 'confirmed'], true)) {
                throw ValidationException::withMessages([
                    'status' => ['Đơn đặt chỗ đã được xử lý trước đó.'],
                ]);
            }

            $this->restoreAvailabilityForBooking($locked);

            $locked->update([
                'status' => 'cancelled',
                'cancel_reason' => $reason ?: 'Người dùng chủ động hủy đơn',
                'cancelled_at' => now(),
            ]);

            return $locked->fresh();
        });
    }

    private function restoreAvailabilityForBooking(Booking $booking): void
    {
        $service = Service::find($booking->service_id);
        if (! $service || ! $booking->start_date) {
            return;
        }

        $dates = $this->resolveRequestedDates(
            $service,
            $booking->start_date->copy()->startOfDay(),
            $booking->end_date?->copy()->startOfDay()
        );
        $slotsToRestore = max(1, (int) $booking->quantity);

        $availabilityRecords = ServiceAvailability::query()
            ->where('service_id', $service->id)
            ->whereIn('available_date', $dates)
            ->lockForUpdate()
            ->get();

        foreach ($availabilityRecords as $row) {
            $row->update(['booked_slots' => max(0, $row->booked_slots - $slotsToRestore)]);
        }
    }

    private function validateDatesForService(Service $service, Carbon $startDate, ?Carbon $endDate): void
    {
        $isStay = in_array($service->type, ['hotel', 'homestay'], true);
        if ($isStay && (! $endDate || $endDate->lessThanOrEqualTo($startDate))) {
            throw ValidationException::withMessages([
                'end_date' => ['Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm.'],
            ]);
        }

        if ($endDate && $endDate->lessThan($startDate)) {
            throw ValidationException::withMessages([
                'end_date' => ['Ngày kết thúc không được trước ngày bắt đầu.'],
            ]);
        }
    }

    private function loadBookableService(int $serviceId): Service
    {
        $service = Service::query()
            ->where('id', $serviceId)
            ->where('status', ServiceStatus::Active->value)
            ->whereHas('provider', fn ($p) => $p->where('status', ProviderStatus::Approved->value))
            ->with([
                'provider:id,business_name,status',
                'category:id,name,slug',
                'policies:id,name,slug,category',
                'promotions.holidayCampaign',
            ])
            ->first();

        if (! $service) {
            throw ValidationException::withMessages([
                'service_id' => ['Dịch vụ không tồn tại hoặc hiện chưa mở bán.'],
            ]);
        }

        return $service;
    }

    private function resolveRoomType(Service $service, mixed $roomTypeId): ?HotelRoomType
    {
        $isStay = in_array($service->type, ['hotel', 'homestay'], true);

        if (! empty($roomTypeId)) {
            $roomType = HotelRoomType::query()
                ->where('id', (int) $roomTypeId)
                ->where('service_id', $service->id)
                ->where('status', 'active')
                ->first();

            if (! $roomType) {
                throw ValidationException::withMessages([
                    'room_type_id' => ['Hạng phòng được chọn không tồn tại hoặc đang tạm ngưng.'],
                ]);
            }

            return $roomType;
        }

        if ($isStay) {
            return HotelRoomType::query()
                ->where('service_id', $service->id)
                ->where('status', 'active')
                ->orderBy('base_price')
                ->first();
        }

        return null;
    }

    /**
     * @return array<int, string>
     */
    private function resolveRequestedDates(Service $service, Carbon $startDate, ?Carbon $endDate): array
    {
        $isStay = in_array($service->type, ['hotel', 'homestay'], true);

        if ($isStay && $endDate) {
            $period = CarbonPeriod::create($startDate, $endDate->copy()->subDay());
            $dates = [];
            foreach ($period as $d) {
                $dates[] = $d->format('Y-m-d');
            }

            return $dates;
        }

        if ($service->type === 'vehicle' && ! $this->isTrainService($service) && $endDate && $endDate->greaterThan($startDate)) {
            $period = CarbonPeriod::create($startDate, $endDate);
            $dates = [];
            foreach ($period as $d) {
                $dates[] = $d->format('Y-m-d');
            }

            return $dates;
        }

        return [$startDate->format('Y-m-d')];
    }

    private function isTrainService(Service $service): bool
    {
        $catSlug = strtolower((string) ($service->category?->slug ?? ''));

        return str_contains($catSlug, 'tau');
    }

    /**
     * @param  Collection<string, ServiceAvailability>  $availabilityRecords
     * @param  array<int, string>  $dates
     * @param  array<string, mixed>  $metadata
     */
    private function assertScheduleAvailable(
        Service $service,
        ?HotelRoomType $roomType,
        array $dates,
        Carbon $startDate,
        ?Carbon $endDate,
        int $quantity,
        array $metadata,
        $availabilityRecords
    ): void {
        // 1. Kiểm tra tồn kho service_availability (ngày khóa hoặc hết slot)
        foreach ($dates as $dateStr) {
            $row = $availabilityRecords->get($dateStr);
            if (! $row) {
                continue;
            }

            if ($row->is_blocked) {
                throw ValidationException::withMessages([
                    'start_date' => ["Ngày {$dateStr} hiện đang được nhà cung cấp khóa lịch."],
                ]);
            }

            $remaining = max(0, $row->total_slots - $row->booked_slots);
            if ($remaining < $quantity) {
                throw ValidationException::withMessages([
                    'start_date' => ["Ngày {$dateStr} chỉ còn {$remaining} chỗ/đơn vị trống, không đủ cho yêu cầu ({$quantity})."],
                ]);
            }
        }

        // 2. Kiểm tra sức chứa & xung đột phòng cho Chỗ ở có hạng phòng
        if ($roomType) {
            $numAdults = (int) ($metadata['num_adults'] ?? 0);
            if ($numAdults > 0 && $roomType->capacity_adults > 0 && $numAdults > ($roomType->capacity_adults * $quantity)) {
                throw ValidationException::withMessages([
                    'metadata.num_adults' => ["Hạng phòng \"{$roomType->name}\" chứa tối đa {$roomType->capacity_adults} người lớn/phòng."],
                ]);
            }

            $totalInventory = (int) ($roomType->inventory ?? $roomType->total_rooms ?? 0);
            if ($totalInventory > 0 && $endDate) {
                $overlappingRooms = (int) Booking::query()
                    ->where('room_type_id', $roomType->id)
                    ->whereIn('status', self::ACTIVE_BOOKING_STATUSES)
                    ->whereDate('start_date', '<', $endDate->format('Y-m-d'))
                    ->where(function ($q) use ($startDate) {
                        $q->whereNull('end_date')
                            ->orWhereDate('end_date', '>', $startDate->format('Y-m-d'));
                    })
                    ->sum('quantity');

                if (($overlappingRooms + $quantity) > $totalInventory) {
                    $roomsLeft = max(0, $totalInventory - $overlappingRooms);
                    throw ValidationException::withMessages([
                        'room_type_id' => ["Hạng phòng \"{$roomType->name}\" chỉ còn {$roomsLeft} phòng trống trong khoảng thời gian bạn chọn."],
                    ]);
                }
            }
        }
    }

    /**
     * Xác định danh sách tỷ lệ thanh toán trước hợp lệ (0%, 30%, 100%) theo loại hình & chính sách dịch vụ.
     *
     * @return array{allowed_rates: array<int, int>, selected_rate: int}
     */
    private function resolveDepositRate(Service $service, mixed $requestedRate): array
    {
        $isFlexibleType = in_array($service->type, ['hotel', 'homestay'], true)
            || ($service->type === 'vehicle' && ! $this->isTrainService($service));

        if (! $isFlexibleType) {
            return ['allowed_rates' => [100], 'selected_rate' => 100];
        }

        $hasDeposit30 = $service->policies->contains(
            fn ($p) => stripos((string) $p->name, 'Đặt cọc giữ chỗ 30%') !== false
        );
        $hasPayAtProperty = $service->policies->contains(
            fn ($p) => stripos((string) $p->name, 'Thanh toán khi nhận phòng') !== false
        );

        $allowed = [100];
        if ($hasDeposit30) {
            $allowed[] = 30;
        }
        if ($hasPayAtProperty) {
            $allowed[] = 0;
        }
        sort($allowed);

        // Nếu client truyền deposit_rate hợp lệ theo chính sách dịch vụ thì dùng lựa chọn đó
        if ($requestedRate !== null && $requestedRate !== '') {
            $rateInt = (int) $requestedRate;
            if (in_array($rateInt, $allowed, true)) {
                return ['allowed_rates' => $allowed, 'selected_rate' => $rateInt];
            }
        }

        // Mặc định: ưu tiên 30% nếu có chính sách cọc 30%, tiếp theo là 0% nếu hỗ trợ trả sau, cuối cùng 100%
        $defaultRate = $hasDeposit30 ? 30 : ($hasPayAtProperty ? 0 : 100);

        return ['allowed_rates' => $allowed, 'selected_rate' => $defaultRate];
    }

    /**
     * @param  Collection<string, ServiceAvailability>  $availabilityRecords
     * @param  array<int, string>  $dates
     * @return array<string, mixed>
     */
    private function calculatePricing(
        ?User $user,
        Service $service,
        ?HotelRoomType $roomType,
        array $dates,
        int $quantity,
        $availabilityRecords,
        ?string $couponCode,
        mixed $requestedDepositRate = null,
        bool $lockCoupon = false
    ): array {
        $baseUnitPrice = $roomType ? (float) $roomType->base_price : (float) $service->base_price;
        $durationUnits = count($dates);

        $subtotal = 0.0;
        foreach ($dates as $dateStr) {
            $row = $availabilityRecords->get($dateStr);
            $dayPrice = ($row && $row->price_override !== null)
                ? (float) $row->price_override
                : $baseUnitPrice;
            $subtotal += $dayPrice * $quantity;
        }
        $unitPrice = $durationUnits > 0 ? round($subtotal / ($durationUnits * $quantity), 2) : $baseUnitPrice;

        // 1. Khuyến mãi chiến dịch lễ hội (service_promotions)
        $servicePromotionId = null;
        $promotionDiscount = 0.0;
        $activePromo = $this->resolveActivePromotion($service);
        if ($activePromo) {
            $campaign = $activePromo->holidayCampaign;
            if ($activePromo->discount_type === 'fixed') {
                $promotionDiscount = min($subtotal, (float) $activePromo->discount_value);
            } else {
                $promotionDiscount = $subtotal * ((float) $activePromo->discount_value / 100);
                if ($campaign && $campaign->max_discount !== null && $campaign->max_discount > 0) {
                    $promotionDiscount = min($promotionDiscount, (float) $campaign->max_discount);
                }
            }
            $promotionDiscount = round($promotionDiscount);
            $servicePromotionId = $activePromo->id;
        }

        $afterPromo = max(0.0, $subtotal - $promotionDiscount);

        // 2. Mã giảm giá Coupon (coupons)
        $couponId = null;
        $normalizedCouponCode = null;
        $couponDiscount = 0.0;

        $trimmedCoupon = trim((string) ($couponCode ?? ''));
        if ($trimmedCoupon !== '') {
            $couponQuery = Coupon::query()->whereRaw('UPPER(code) = ?', [strtoupper($trimmedCoupon)]);
            if ($lockCoupon) {
                $couponQuery->lockForUpdate();
            }
            $coupon = $couponQuery->first();

            if (! $coupon) {
                throw ValidationException::withMessages([
                    'coupon_code' => ['Mã giảm giá không tồn tại.'],
                ]);
            }

            $now = now();
            if (($coupon->valid_from && $now->lt($coupon->valid_from)) || ($coupon->valid_until && $now->gt($coupon->valid_until))) {
                throw ValidationException::withMessages([
                    'coupon_code' => ['Mã giảm giá chưa đến hạn hoặc đã hết hạn sử dụng.'],
                ]);
            }

            if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
                throw ValidationException::withMessages([
                    'coupon_code' => ['Mã giảm giá đã hết lượt sử dụng trên hệ thống.'],
                ]);
            }

            if ($user && $coupon->per_user_limit !== null) {
                $userUsedCount = Booking::query()
                    ->where('user_id', $user->id)
                    ->where('coupon_id', $coupon->id)
                    ->where('status', '!=', 'cancelled')
                    ->count();

                if ($userUsedCount >= $coupon->per_user_limit) {
                    throw ValidationException::withMessages([
                        'coupon_code' => ['Bạn đã sử dụng hết số lần cho phép của mã giảm giá này.'],
                    ]);
                }
            }

            if ($coupon->min_order_amount !== null && $afterPromo < (float) $coupon->min_order_amount) {
                $minFormatted = number_format((float) $coupon->min_order_amount, 0, ',', '.');
                throw ValidationException::withMessages([
                    'coupon_code' => ["Đơn hàng tối thiểu {$minFormatted}₫ mới được áp dụng mã này."],
                ]);
            }

            if ($coupon->type === 'fixed') {
                $couponDiscount = min($afterPromo, (float) $coupon->discount_value);
            } else {
                $couponDiscount = min($afterPromo, $afterPromo * ((float) $coupon->discount_value / 100));
            }
            $couponDiscount = round($couponDiscount);
            $couponId = $coupon->id;
            $normalizedCouponCode = $coupon->code;
        }

        $totalAmount = max(0.0, round($afterPromo - $couponDiscount));

        // 3. Tính tỷ lệ thanh toán trước (0%, 30%, 100%)
        $depositConfig = $this->resolveDepositRate($service, $requestedDepositRate);
        $depositRate = $depositConfig['selected_rate'];
        $depositAmount = $depositRate === 0
            ? 0.0
            : ($depositRate === 100 ? $totalAmount : round($totalAmount * ($depositRate / 100)));
        $remainingAmount = max(0.0, $totalAmount - $depositAmount);

        return [
            'unit_price' => $unitPrice,
            'subtotal' => round($subtotal),
            'service_promotion_id' => $servicePromotionId,
            'promotion_discount_amount' => $promotionDiscount,
            'coupon_id' => $couponId,
            'coupon_code' => $normalizedCouponCode,
            'coupon_discount_amount' => $couponDiscount,
            'total_amount' => $totalAmount,
            'allowed_deposit_rates' => $depositConfig['allowed_rates'],
            'deposit_rate' => $depositRate,
            'deposit_amount' => $depositAmount,
            'remaining_amount' => $remainingAmount,
        ];
    }

    private function resolveActivePromotion(Service $service): ?ServicePromotion
    {
        $now = now();
        $activePromos = $service->promotions->filter(function (ServicePromotion $promo) use ($now) {
            $campaign = $promo->holidayCampaign;

            return $promo->is_active
                && $campaign
                && $campaign->status === 'active'
                && $campaign->starts_at <= $now
                && $campaign->ends_at >= $now;
        });

        if ($activePromos->isEmpty()) {
            return null;
        }

        return $activePromos->sortByDesc(function (ServicePromotion $promo) {
            $campaign = $promo->holidayCampaign;
            $boost = max(0, (float) $promo->discount_value - (float) $campaign->discount_value);

            return ((int) $campaign->priority * 10000) + ($boost > 0 ? 5000 + ($boost * 10) : 0);
        })->first();
    }

    private function generateBookingCode(): string
    {
        do {
            $code = 'STB-'.now()->format('Ymd').'-'.strtoupper(Str::random(4));
        } while (Booking::where('booking_code', $code)->exists());

        return $code;
    }
}
