<?php

namespace App\Http\Requests\Provider;

use App\Enums\ServiceStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'location_id' => ['sometimes', 'required', 'integer', 'exists:locations,id'],
            'status' => ['nullable', 'string', Rule::in(ServiceStatus::providerMutableValues())],
            'description' => ['sometimes', 'required', 'string'],
            'base_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'address' => ['sometimes', 'required', 'string', 'max:1000'],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['string', 'max:255'],
            'includes' => ['nullable', 'array'],
            'includes.*' => ['string', 'max:255'],
            'excludes' => ['nullable', 'array'],
            'excludes.*' => ['string', 'max:255'],

            'availabilities' => ['nullable', 'array'],
            'availabilities.*.available_date' => ['required_with:availabilities', 'date'],
            'availabilities.*.total_slots' => ['required_with:availabilities', 'integer', 'min:0'],
            'availabilities.*.price_override' => ['nullable', 'numeric', 'min:0'],
            'availabilities.*.is_blocked' => ['nullable', 'boolean'],

            'schedules' => ['nullable', 'array'],
            'schedules.*.day_number' => ['required_with:schedules', 'integer', 'min:1'],
            'schedules.*.title' => ['required_with:schedules', 'string', 'max:255'],
            'schedules.*.description' => ['nullable', 'string'],
            'schedules.*.activities' => ['nullable', 'array'],
            'schedules.*.activities.*' => ['string', 'max:500'],

            'room_types' => ['nullable', 'array'],
            'room_types.*.id' => ['nullable', 'integer'],
            'room_types.*.name' => ['required_with:room_types', 'string', 'max:255'],
            'room_types.*.rank' => ['nullable', 'string', 'max:100'],
            'room_types.*.description' => ['nullable', 'string'],
            'room_types.*.base_price' => ['required_with:room_types', 'numeric', 'min:0'],
            'room_types.*.total_rooms' => ['required_with:room_types', 'integer', 'min:1'],
            'room_types.*.inventory' => ['nullable', 'integer', 'min:0'],
            'room_types.*.capacity_adults' => ['required_with:room_types', 'integer', 'min:1'],
            'room_types.*.capacity_children' => ['nullable', 'integer', 'min:0'],
            'room_types.*.amenities' => ['nullable', 'array'],
            'room_types.*.amenities.*' => ['string', 'max:255'],
            'room_types.*.status' => ['nullable', 'string', Rule::in(['active', 'inactive'])],
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'Provider chỉ có thể chuyển dịch vụ về bản nháp (draft) hoặc gửi duyệt (pending_review).',
            'base_price.min' => 'Giá cơ sở không được âm.',
        ];
    }
}
