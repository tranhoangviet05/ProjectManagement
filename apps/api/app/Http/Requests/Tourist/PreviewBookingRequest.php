<?php

namespace App\Http\Requests\Tourist;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PreviewBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'room_type_id' => ['nullable', 'integer'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:50'],
            'deposit_rate' => ['nullable', 'integer', Rule::in([0, 30, 100])],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'metadata' => ['nullable', 'array'],
            'metadata.num_adults' => ['nullable', 'integer', 'min:1', 'max:50'],
            'metadata.num_children' => ['nullable', 'integer', 'min:0', 'max:50'],
            'metadata.has_pets' => ['nullable', 'boolean'],
            'metadata.pickup_location' => ['nullable', 'string', 'max:255'],
        ];
    }
}
