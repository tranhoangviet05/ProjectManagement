<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\WalletTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBookingController extends Controller
{
    /**
     * GET /api/v1/admin/bookings
     * Giám sát danh sách đơn đặt chỗ toàn sàn kèm trạng thái thanh toán.
     */
    public function index(Request $request): JsonResponse
    {
        $status = (string) $request->query('status', 'all');
        $paymentStatus = (string) $request->query('payment_status', 'all');
        $search = trim((string) $request->query('q', ''));
        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);

        $query = Booking::query()
            ->with([
                'user:id,email',
                'service:id,name,type',
                'provider:id,business_name',
                'latestPayment',
            ])
            ->latest('created_at');

        if ($status !== '' && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($paymentStatus !== '' && $paymentStatus !== 'all') {
            $query->whereHas('latestPayment', fn ($p) => $p->where('status', $paymentStatus));
        }

        if ($search !== '') {
            $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';
            $query->where(function ($sub) use ($like) {
                $sub->where('booking_code', 'ilike', $like)
                    ->orWhere('contact_name', 'ilike', $like)
                    ->orWhere('contact_email', 'ilike', $like)
                    ->orWhere('contact_phone', 'ilike', $like)
                    ->orWhereHas('service', fn ($s) => $s->where('name', 'ilike', $like))
                    ->orWhereHas('provider', fn ($p) => $p->where('business_name', 'ilike', $like));
            });
        }

        $paginated = $query->paginate($perPage);
        $items = collect($paginated->items())->map(fn (Booking $b) => $this->transformBooking($b))->values();

        return response()->json([
            'success' => true,
            'counts' => [
                'all' => Booking::count(),
                'pending_payment' => Booking::where('status', 'pending_payment')->count(),
                'confirmed' => Booking::where('status', 'confirmed')->count(),
                'checked_in' => Booking::where('status', 'checked_in')->count(),
                'completed' => Booking::where('status', 'completed')->count(),
                'cancelled' => Booking::whereIn('status', ['cancelled', 'refunded'])->count(),
            ],
            'data' => $items,
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    /**
     * GET /api/v1/admin/bookings/{id}
     * Chi tiết đơn đặt chỗ, lịch sử thanh toán và biến động ví Escrow liên quan.
     */
    public function show(int $id): JsonResponse
    {
        $booking = Booking::query()
            ->with([
                'user:id,email',
                'service:id,name,type,price_unit',
                'provider:id,business_name,phone',
                'roomType:id,name',
                'payments' => fn ($q) => $q->latest('created_at'),
            ])
            ->find($id);

        if (! $booking) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn đặt chỗ.'], 404);
        }

        $walletTransactions = WalletTransaction::query()
            ->where('reference_id', $booking->booking_code)
            ->latest('created_at')
            ->get()
            ->map(fn (WalletTransaction $tx) => [
                'id' => $tx->id,
                'wallet_id' => $tx->wallet_id,
                'type' => $tx->type,
                'amount' => (float) $tx->amount,
                'balance_before' => (float) $tx->balance_before,
                'balance_after' => (float) $tx->balance_after,
                'note' => $tx->note,
                'created_at' => $tx->created_at,
            ]);

        return response()->json([
            'success' => true,
            'data' => array_merge($this->transformBooking($booking, true), [
                'wallet_transactions' => $walletTransactions,
            ]),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function transformBooking(Booking $b, bool $detailed = false): array
    {
        $latestPayment = $detailed ? $b->payments->first() : $b->latestPayment;

        $payload = [
            'id' => $b->id,
            'booking_code' => $b->booking_code,
            'status' => $b->status,
            'payment_expires_at' => $b->payment_expires_at,
            'start_date' => $b->start_date?->toDateString(),
            'end_date' => $b->end_date?->toDateString(),
            'checked_in_at' => $b->checked_in_at,
            'quantity' => $b->quantity,
            'duration_units' => $b->duration_units,
            'subtotal' => (float) $b->subtotal,
            'promotion_discount_amount' => (float) $b->promotion_discount_amount,
            'coupon_discount_amount' => (float) $b->coupon_discount_amount,
            'total_amount' => (float) $b->total_amount,
            'deposit_rate' => (int) $b->deposit_rate,
            'deposit_amount' => (float) $b->deposit_amount,
            'remaining_amount' => (float) $b->remaining_amount,
            'metadata' => $b->metadata,
            'contact_name' => $b->contact_name,
            'contact_phone' => $b->contact_phone,
            'contact_email' => $b->contact_email,
            'service' => $b->service ? [
                'id' => $b->service->id,
                'name' => $b->service->name,
                'type' => $b->service->type,
            ] : null,
            'provider' => $b->provider ? [
                'id' => $b->provider->id,
                'business_name' => $b->provider->business_name,
                'phone' => $detailed ? $b->provider->phone : null,
            ] : null,
            'latest_payment' => $latestPayment ? [
                'id' => $latestPayment->id,
                'payment_method' => $latestPayment->payment_method,
                'amount' => (float) $latestPayment->amount,
                'transaction_code' => $latestPayment->transaction_code,
                'status' => $latestPayment->status,
                'paid_at' => $latestPayment->paid_at,
            ] : null,
            'created_at' => $b->created_at,
        ];

        if ($detailed) {
            $payload['room_type'] = $b->roomType ? ['id' => $b->roomType->id, 'name' => $b->roomType->name] : null;
            $payload['special_requests'] = $b->special_requests;
            $payload['cancel_reason'] = $b->cancel_reason;
            $payload['cancelled_at'] = $b->cancelled_at;
            $payload['payments'] = $b->payments->map(fn ($p) => [
                'id' => $p->id,
                'payment_method' => $p->payment_method,
                'amount' => (float) $p->amount,
                'currency' => $p->currency,
                'transaction_code' => $p->transaction_code,
                'status' => $p->status,
                'paid_at' => $p->paid_at,
                'gateway_response' => $p->gateway_response,
            ])->values();
        }

        return $payload;
    }
}
