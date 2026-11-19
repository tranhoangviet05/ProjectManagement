<?php

namespace App\Http\Requests\Provider;

use App\Enums\ServiceStatus;
use App\Enums\ServiceType;
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
            'type' => ['sometimes', 'required', 'string', Rule::in(ServiceType::values())],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'status' => ['nullable', 'string', Rule::in(ServiceStatus::providerMutableValues())],
            'description' => ['nullable', 'string'],
            'base_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'price_unit' => ['sometimes', 'required', 'string', 'max:50'],
            'max_guests' => ['sometimes', 'required', 'integer', 'min:1'],
            'duration_days' => ['nullable', 'integer', 'min:1'],
            'duration_nights' => ['nullable', 'integer', 'min:0'],
            'address' => ['nullable', 'string', 'max:1000'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['string', 'max:255'],
            'includes' => ['nullable', 'array'],
            'includes.*' => ['string', 'max:255'],
            'excludes' => ['nullable', 'array'],
            'excludes.*' => ['string', 'max:255'],
            'schedules' => ['nullable', 'array'],
            'schedules.*.day_number' => ['required_with:schedules', 'integer', 'min:1'],
            'schedules.*.title' => ['required_with:schedules', 'string', 'max:255'],
            'schedules.*.description' => ['nullable', 'string'],
            'schedules.*.activities' => ['nullable', 'array'],
            'schedules.*.activities.*' => ['string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'Provider chỉ có thể chuyển dịch vụ về bản nháp (draft) hoặc gửi duyệt (pending_review).',
            'base_price.min' => 'Giá cơ sở không được âm.',
            'max_guests.min' => 'Sức chứa tối đa phải lớn hơn hoặc bằng 1.',
        ];
    }
}
