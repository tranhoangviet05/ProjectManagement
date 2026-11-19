<?php

namespace App\Http\Requests\Provider;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateHotelRoomTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'rank' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'base_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'total_rooms' => ['sometimes', 'required', 'integer', 'min:1'],
            'inventory' => ['nullable', 'integer', 'min:0'],
            'capacity_adults' => ['sometimes', 'required', 'integer', 'min:1'],
            'capacity_children' => ['nullable', 'integer', 'min:0'],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['string', 'max:255'],
            'images' => ['nullable', 'array'],
            'status' => ['nullable', 'string', Rule::in(['active', 'inactive'])],
        ];
    }
}
