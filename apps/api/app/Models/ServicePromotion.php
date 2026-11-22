<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServicePromotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'holiday_campaign_id',
        'service_id',
        'discount_type',
        'discount_value',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'float',
            'is_active' => 'boolean',
        ];
    }

    public function holidayCampaign(): BelongsTo
    {
        return $this->belongsTo(HolidayCampaign::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
