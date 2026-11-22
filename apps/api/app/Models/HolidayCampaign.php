<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HolidayCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'badge_text',
        'banner_url',
        'description',
        'discount_type',
        'discount_value',
        'max_discount',
        'starts_at',
        'ends_at',
        'priority',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'float',
            'max_discount' => 'float',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'priority' => 'integer',
        ];
    }

    public function promotions(): HasMany
    {
        return $this->hasMany(ServicePromotion::class);
    }

    public function scopeCurrentlyActive(Builder $query): Builder
    {
        $now = now();

        return $query
            ->where('status', 'active')
            ->where('starts_at', '<=', $now)
            ->where('ends_at', '>=', $now);
    }
}
