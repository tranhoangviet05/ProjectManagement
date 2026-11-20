<?php

namespace App\Http\Requests\Provider;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreHotelRoomTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'rank' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'total_rooms' => ['required', 'integer', 'min:1'],
            'inventory' => ['nullable', 'integer', 'min:0', 'lte:total_rooms'],
            'capacity_adults' => ['required', 'integer', 'min:1'],
            'capacity_children' => ['nullable', 'integer', 'min:0'],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['string', 'max:255'],
            'images' => ['nullable', 'array'],
            'status' => ['nullable', 'string', Rule::in(['active', 'inactive'])],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Vui lòng nhập tên loại phòng.',
            'base_price.required' => 'Vui lòng nhập giá cơ sở của phòng.',
            'total_rooms.required' => 'Vui lòng nhập tổng số phòng.',
            'inventory.lte' => 'Số phòng còn trống không thể lớn hơn tổng số phòng.',
            'capacity_adults.required' => 'Vui lòng nhập sức chứa người lớn.',
        ];
    }
}
