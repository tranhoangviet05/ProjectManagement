<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceAvailability extends Model
{
    use HasFactory;

    protected $table = 'service_availability';

    protected $fillable = [
        'service_id',
        'available_date',
        'total_slots',
        'booked_slots',
        'price_override',
        'is_blocked',
    ];

    protected function casts(): array
    {
        return [
            'available_date' => 'date:Y-m-d',
            'total_slots' => 'integer',
            'booked_slots' => 'integer',
            'price_override' => 'decimal:2',
            'is_blocked' => 'boolean',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
