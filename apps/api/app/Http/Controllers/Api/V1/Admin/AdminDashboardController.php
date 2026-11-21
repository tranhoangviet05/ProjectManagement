<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ProviderStatus;
use App\Enums\ServiceStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ContentReport;
use App\Models\Coupon;
use App\Models\Post;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * GET /api/v1/admin/dashboard
     * Tổng hợp KPI vận hành thực tế, cơ cấu sàn, 4 biểu đồ mặc định và danh sách tác vụ gần đây.
     */
    public function overview(Request $request): JsonResponse
    {
        $now = Carbon::now();
        $year = (int) $request->query('year', $now->year);
        $month = (int) $request->query('month', $now->month);
        $period = (string) $request->query('period', '12m');

        $touristsCount = User::where('role', UserRole::Tourist->value)->count();
        $providersCount = User::where('role', UserRole::Provider->value)->count();

        $kpis = [
            'pending_providers_count' => ProviderProfile::where('status', ProviderStatus::Pending->value)->count(),
            'approved_providers_count' => ProviderProfile::where('status', ProviderStatus::Approved->value)->count(),
            'pending_services_count' => Service::where('status', ServiceStatus::PendingReview->value)->count(),
            'active_services_count' => Service::where('status', ServiceStatus::Active->value)->count(),
            'total_users_count' => $touristsCount + $providersCount,
            'tourists_count' => $touristsCount,
            'providers_count' => $providersCount,
            'total_bookings_count' => Booking::count(),
            'confirmed_bookings_count' => Booking::whereIn('status', ['confirmed', 'checked_in', 'completed'])->count(),
            'pending_bookings_count' => Booking::where('status', 'pending_payment')->count(),
            'cancelled_bookings_count' => Booking::whereIn('status', ['cancelled', 'refunded'])->count(),
            'total_gmv' => (float) Booking::whereIn('status', ['confirmed', 'checked_in', 'completed'])->sum('total_amount'),
            'total_posts_count' => Post::count(),
            'pending_reports_count' => ContentReport::where('status', 'pending')->count(),
            'active_coupons_count' => Coupon::count(),
        ];

        $serviceBreakdown = [
            'tour' => Service::where('type', 'tour')->count(),
            'hotel' => Service::where('type', 'hotel')->count(),
            'homestay' => Service::where('type', 'homestay')->count(),
            'vehicle' => Service::where('type', 'vehicle')->count(),
        ];

        $charts = [
            'gmv' => $this->buildMetricSeries('gmv', $period, $year, $month),
            'bookings' => $this->buildMetricSeries('bookings', $period, $year, $month),
            'users' => $this->buildMetricSeries('users', $period, $year, $month),
            'posts' => $this->buildMetricSeries('posts', $period, $year, $month),
        ];

        $recentPendingProviders = ProviderProfile::query()
            ->where('status', ProviderStatus::Pending->value)
            ->with('businessType:id,name')
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(fn (ProviderProfile $p) => [
                'id' => $p->id,
                'business_name' => $p->business_name,
                'representative_name' => $p->representative_name,
                'business_type' => $p->businessType?->name,
                'created_at' => $p->created_at,
            ]);

        $recentPendingServices = Service::query()
            ->where('status', ServiceStatus::PendingReview->value)
            ->with('provider:id,business_name')
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(fn (Service $s) => [
                'id' => $s->id,
                'name' => $s->name,
                'type' => $s->type,
                'base_price' => (float) $s->base_price,
                'price_unit' => $s->price_unit,
                'provider_name' => $s->provider?->business_name ?? 'Đối tác',
                'created_at' => $s->created_at,
            ]);

        $recentBookings = Booking::query()
            ->with(['service:id,name', 'provider:id,business_name'])
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(fn (Booking $b) => [
                'id' => $b->id,
                'booking_code' => $b->booking_code,
                'contact_name' => $b->contact_name,
                'service_name' => $b->service?->name ?? 'Dịch vụ',
                'provider_name' => $b->provider?->business_name ?? 'Đối tác',
                'total_amount' => (float) $b->total_amount,
                'status' => $b->status,
                'created_at' => $b->created_at,
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'kpis' => $kpis,
                'service_breakdown' => $serviceBreakdown,
                'charts' => $charts,
                'recent_pending_providers' => $recentPendingProviders,
                'recent_pending_services' => $recentPendingServices,
                'recent_bookings' => $recentBookings,
            ],
        ]);
    }

    /**
     * GET /api/v1/admin/dashboard/chart?metric=gmv|bookings|users|posts&period=7d|month_days|12m|5y&year=2026&month=11
     * Trả dữ liệu chuỗi thời gian cho từng biểu đồ độc lập khi Admin đổi bộ lọc Ngày / Tháng / Năm.
     */
    public function chart(Request $request): JsonResponse
    {
        $metric = (string) $request->query('metric', 'gmv');
        if (! in_array($metric, ['gmv', 'bookings', 'users', 'posts'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ số biểu đồ không hợp lệ.',
            ], 422);
        }

        $now = Carbon::now();
        $period = (string) $request->query('period', '12m');
        $year = (int) $request->query('year', $now->year);
        $month = min(max((int) $request->query('month', $now->month), 1), 12);

        return response()->json([
            'success' => true,
            'data' => $this->buildMetricSeries($metric, $period, $year, $month),
        ]);
    }

    /**
     * Xây dựng dữ liệu chuỗi thời gian theo Ngày (7d / month_days), Tháng (12m) hoặc Năm (5y)
     * kèm tổng kỳ hiện tại, tổng kỳ liền trước và % tăng trưởng.
     *
     * @return array<string, mixed>
     */
    private function buildMetricSeries(string $metric, string $period, int $year, int $month): array
    {
        $buckets = [];
        $prevStart = null;
        $prevEnd = null;

        if ($period === '7d') {
            $end = Carbon::today()->endOfDay();
            $start = Carbon::today()->subDays(6)->startOfDay();
            $prevEnd = $start->copy()->subSecond();
            $prevStart = $start->copy()->subDays(7);

            for ($i = 0; $i < 7; $i++) {
                $d = $start->copy()->addDays($i);
                $buckets[] = [
                    'label' => $d->format('d/m'),
                    'full_label' => 'Ngày '.$d->format('d/m/Y'),
                    'start' => $d->copy()->startOfDay(),
                    'end' => $d->copy()->endOfDay(),
                ];
            }
        } elseif ($period === 'month_days') {
            $firstDay = Carbon::create($year, $month, 1)->startOfDay();
            $daysInMonth = $firstDay->daysInMonth;
            $prevMonth = $firstDay->copy()->subMonth();
            $prevStart = $prevMonth->copy()->startOfMonth();
            $prevEnd = $prevMonth->copy()->endOfMonth();

            for ($day = 1; $day <= $daysInMonth; $day++) {
                $d = Carbon::create($year, $month, $day);
                $buckets[] = [
                    'label' => $d->format('d'),
                    'full_label' => 'Ngày '.$d->format('d/m/Y'),
                    'start' => $d->copy()->startOfDay(),
                    'end' => $d->copy()->endOfDay(),
                ];
            }
        } elseif ($period === '5y') {
            $startYear = $year - 4;
            $prevStart = Carbon::create($startYear - 5, 1, 1)->startOfYear();
            $prevEnd = Carbon::create($startYear - 1, 12, 31)->endOfYear();

            for ($y = $startYear; $y <= $year; $y++) {
                $d = Carbon::create($y, 1, 1);
                $buckets[] = [
                    'label' => (string) $y,
                    'full_label' => 'Năm '.$y,
                    'start' => $d->copy()->startOfYear(),
                    'end' => $d->copy()->endOfYear(),
                ];
            }
        } else {
            // Mặc định '12m': 12 tháng trong năm $year
            $period = '12m';
            $prevStart = Carbon::create($year - 1, 1, 1)->startOfYear();
            $prevEnd = Carbon::create($year - 1, 12, 31)->endOfYear();

            for ($m = 1; $m <= 12; $m++) {
                $d = Carbon::create($year, $m, 1);
                $buckets[] = [
                    'label' => 'T'.$m,
                    'full_label' => 'Tháng '.$m.'/'.$year,
                    'start' => $d->copy()->startOfMonth(),
                    'end' => $d->copy()->endOfMonth(),
                ];
            }
        }

        $rangeStart = $buckets[0]['start'];
        $rangeEnd = $buckets[count($buckets) - 1]['end'];

        $records = $this->fetchRecordsInWindow($metric, $rangeStart, $rangeEnd);
        $previousTotal = $this->calculateWindowTotal($metric, $prevStart, $prevEnd);

        $series = [];
        $currentTotal = 0.0;

        foreach ($buckets as $bucket) {
            $bStart = $bucket['start'];
            $bEnd = $bucket['end'];

            $slice = $records->filter(function ($row) use ($bStart, $bEnd) {
                $dt = Carbon::parse($row->created_at);

                return $dt->betweenIncluded($bStart, $bEnd);
            });

            if ($metric === 'gmv') {
                $val = (float) $slice->sum('total_amount');
            } else {
                $val = (float) $slice->count();
            }

            $currentTotal += $val;

            $series[] = [
                'label' => $bucket['label'],
                'full_label' => $bucket['full_label'],
                'value' => $val,
            ];
        }

        $growthPercent = null;
        if ($previousTotal > 0) {
            $growthPercent = round((($currentTotal - $previousTotal) / $previousTotal) * 100, 1);
        } elseif ($currentTotal > 0) {
            $growthPercent = 100.0;
        } else {
            $growthPercent = 0.0;
        }

        return [
            'metric' => $metric,
            'period' => $period,
            'year' => $year,
            'month' => $month,
            'total' => $currentTotal,
            'previous_total' => $previousTotal,
            'growth_percent' => $growthPercent,
            'series' => $series,
        ];
    }

    private function fetchRecordsInWindow(string $metric, Carbon $start, Carbon $end)
    {
        return match ($metric) {
            'gmv' => Booking::query()
                ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
                ->whereBetween('created_at', [$start, $end])
                ->get(['id', 'total_amount', 'created_at']),
            'bookings' => Booking::query()
                ->whereBetween('created_at', [$start, $end])
                ->get(['id', 'status', 'created_at']),
            'users' => User::query()
                ->whereIn('role', [UserRole::Provider->value, UserRole::Tourist->value])
                ->whereBetween('created_at', [$start, $end])
                ->get(['id', 'role', 'created_at']),
            'posts' => Post::query()
                ->whereBetween('created_at', [$start, $end])
                ->get(['id', 'created_at']),
        };
    }

    private function calculateWindowTotal(string $metric, ?Carbon $start, ?Carbon $end): float
    {
        if (! $start || ! $end) {
            return 0.0;
        }

        return match ($metric) {
            'gmv' => (float) Booking::query()
                ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
                ->whereBetween('created_at', [$start, $end])
                ->sum('total_amount'),
            'bookings' => (float) Booking::query()
                ->whereBetween('created_at', [$start, $end])
                ->count(),
            'users' => (float) User::query()
                ->whereIn('role', [UserRole::Provider->value, UserRole::Tourist->value])
                ->whereBetween('created_at', [$start, $end])
                ->count(),
            'posts' => (float) Post::query()
                ->whereBetween('created_at', [$start, $end])
                ->count(),
        };
    }
}
