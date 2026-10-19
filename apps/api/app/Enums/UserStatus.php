<?php

namespace App\Enums;

enum UserStatus: string
{
    case Active = 'active';
    case Banned = 'banned';
    case Pending = 'pending';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
