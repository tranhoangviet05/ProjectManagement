<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HotelRoomType extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'name',
        'rank',
        'description',
        'base_price',
        'total_rooms',
        'inventory',
        'capacity_adults',
        'capacity_children',
        'amenities',
        'images',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'total_rooms' => 'integer',
            'inventory' => 'integer',
            'capacity_adults' => 'integer',
            'capacity_children' => 'integer',
            'amenities' => 'array',
            'images' => 'array',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'room_type_id');
    }
}
