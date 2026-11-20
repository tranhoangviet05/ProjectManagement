<?php

namespace App\Enums;

enum ServiceType: string
{
    case Tour = 'tour';
    case Hotel = 'hotel';
    case Homestay = 'homestay';
    case Vehicle = 'vehicle';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
