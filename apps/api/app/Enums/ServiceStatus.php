<?php

namespace App\Enums;

enum ServiceStatus: string
{
    case Draft = 'draft';
    case PendingReview = 'pending_review';
    case Active = 'active';
    case Rejected = 'rejected';

    public static function providerMutableValues(): array
    {
        return [
            self::Draft->value,
            self::PendingReview->value,
        ];
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
