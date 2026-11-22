<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Enums\ServiceStatus;
use App\Http\Controllers\Controller;
use App\Models\HolidayCampaign;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\ServicePromotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProviderCampaignController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $provider = ProviderProfile::where('user_id', $request->user()->id)->first();
        if (! $provider) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn chưa đăng ký hồ sơ Nhà cung cấp.',
            ], 403);
        }

        $services = Service::query()
            ->where('provider_id', $provider->id)
            ->with(['media' => fn ($m) => $m->orderByDesc('is_cover')->orderBy('sort_order')])
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Service $svc) {
                $cover = $svc->media->firstWhere('is_cover', true) ?? $svc->media->first();

                return [
                    'id' => $svc->id,
                    'name' => $svc->name,
                    'type' => $svc->type,
                    'status' => $svc->status,
                    'base_price' => (float) $svc->base_price,
                    'price_unit' => $svc->price_unit,
                    'cover_image' => $cover?->url,
                ];
            })
            ->values();

        $serviceIds = $services->pluck('id')->all();

        $campaigns = HolidayCampaign::query()
            ->whereIn('status', ['active', 'draft'])
            ->where('ends_at', '>=', now())
            ->with([
                'promotions' => fn ($p) => $p->whereIn('service_id', $serviceIds),
            ])
            ->orderByDesc('priority')
            ->orderBy('starts_at')
            ->get()
            ->map(function (HolidayCampaign $campaign) {
                return [
                    'id' => $campaign->id,
                    'name' => $campaign->name,
                    'slug' => $campaign->slug,
                    'badge_text' => $campaign->badge_text,
                    'banner_url' => $campaign->banner_url,
                    'description' => $campaign->description,
                    'discount_type' => $campaign->discount_type,
                    'discount_value' => (float) $campaign->discount_value,
                    'max_discount' => $campaign->max_discount ? (float) $campaign->max_discount : null,
                    'starts_at' => $campaign->starts_at?->toIso8601String(),
                    'ends_at' => $campaign->ends_at?->toIso8601String(),
                    'priority' => $campaign->priority,
                    'status' => $campaign->status,
                    'participations' => $campaign->promotions->map(fn (ServicePromotion $promo) => [
                        'id' => $promo->id,
                        'service_id' => $promo->service_id,
                        'discount_type' => $promo->discount_type,
                        'discount_value' => (float) $promo->discount_value,
                        'is_active' => $promo->is_active,
                    ])->values(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'campaigns' => $campaigns,
                'services' => $services,
            ],
        ]);
    }

    public function toggleService(Request $request, int $campaignId): JsonResponse
    {
        $provider = ProviderProfile::where('user_id', $request->user()->id)->first();
        if (! $provider) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn chưa đăng ký hồ sơ Nhà cung cấp.',
            ], 403);
        }

        $campaign = HolidayCampaign::find($campaignId);
        if (! $campaign || $campaign->status === 'ended') {
            return response()->json([
                'success' => false,
                'message' => 'Chương trình khuyến mãi không tồn tại hoặc đã kết thúc.',
            ], 404);
        }

        $validated = $request->validate([
            'service_id' => ['required', 'integer'],
            'is_active' => ['required', 'boolean'],
            'discount_value' => ['nullable', 'numeric', 'min:1'],
        ]);

        $service = Service::where('id', $validated['service_id'])
            ->where('provider_id', $provider->id)
            ->first();

        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không sở hữu dịch vụ này.',
            ], 403);
        }

        if ($validated['is_active'] && $service->status !== ServiceStatus::Active->value) {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ những dịch vụ đã được Admin duyệt mở bán mới có thể tham gia chương trình khuyến mãi.',
            ], 422);
        }

        $discountValue = isset($validated['discount_value'])
            ? (float) $validated['discount_value']
            : (float) $campaign->discount_value;

        if ($validated['is_active'] && $discountValue < (float) $campaign->discount_value) {
            return response()->json([
                'success' => false,
                'message' => 'Mức khuyến mãi của dịch vụ không được thấp hơn mức tối thiểu của chiến dịch ('.$campaign->discount_value.').',
            ], 422);
        }

        $promotion = ServicePromotion::updateOrCreate(
            [
                'holiday_campaign_id' => $campaign->id,
                'service_id' => $service->id,
            ],
            [
                'discount_type' => $campaign->discount_type,
                'discount_value' => $discountValue,
                'is_active' => (bool) $validated['is_active'],
            ]
        );

        return response()->json([
            'success' => true,
            'message' => $promotion->is_active
                ? 'Đã đăng ký dịch vụ tham gia chương trình khuyến mãi.'
                : 'Đã tạm ngưng tham gia khuyến mãi cho dịch vụ này.',
            'data' => $promotion,
        ]);
    }
}
