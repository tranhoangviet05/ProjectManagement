<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'provider_id',
        'category_id',
        'location_id',
        'name',
        'slug',
        'description',
        'type',
        'status',
        'base_price',
        'price_unit',
        'max_guests',
        'duration_days',
        'duration_nights',
        'address',
        'latitude',
        'longitude',
        'amenities',
        'includes',
        'excludes',
        'rating_avg',
        'total_bookings',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'rating_avg' => 'float',
            'amenities' => 'array',
            'includes' => 'array',
            'excludes' => 'array',
            'latitude' => 'float',
            'longitude' => 'float',
            'max_guests' => 'integer',
            'duration_days' => 'integer',
            'duration_nights' => 'integer',
            'total_bookings' => 'integer',
        ];
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(ProviderProfile::class, 'provider_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(ServiceMedia::class)->orderBy('sort_order', 'asc');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(ServiceSchedule::class)->orderBy('day_number', 'asc');
    }

    public function roomTypes(): HasMany
    {
        return $this->hasMany(HotelRoomType::class);
    }

    public function availability(): HasMany
    {
        return $this->hasMany(ServiceAvailability::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class)->latest();
    }
}
