<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Amenity extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'scope',
        'applicable_types',
        'icon',
        'description',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'applicable_types' => 'array',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
