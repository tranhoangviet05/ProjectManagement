<?php

namespace App\Enums;

enum UserRole: string
{
    case Tourist = 'tourist';
    case Provider = 'provider';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Tourist => 'Khách du lịch',
            self::Provider => 'Nhà cung cấp dịch vụ',
            self::Admin => 'Quản trị viên',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
