<?php

namespace App\Http\Requests\Provider;

use App\Enums\ServiceStatus;
use App\Enums\ServiceType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', Rule::in(ServiceType::values())],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'status' => ['nullable', 'string', Rule::in(ServiceStatus::providerMutableValues())],
            'description' => ['nullable', 'string'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'price_unit' => ['required', 'string', 'max:50'],
            'max_guests' => ['required', 'integer', 'min:1'],
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
            'name.required' => 'Tên dịch vụ không được để trống.',
            'type.required' => 'Vui lòng chọn loại hình dịch vụ.',
            'type.in' => 'Loại hình dịch vụ không hợp lệ.',
            'status.in' => 'Trạng thái tạo mới chỉ chấp nhận bản nháp (draft) hoặc chờ duyệt (pending_review).',
            'base_price.required' => 'Giá cơ sở không được để trống.',
            'base_price.min' => 'Giá cơ sở không được âm.',
            'price_unit.required' => 'Đơn vị tính giá không được để trống.',
            'max_guests.required' => 'Sức chứa tối đa không được để trống.',
            'max_guests.min' => 'Sức chứa tối đa phải lớn hơn hoặc bằng 1.',
        ];
    }
}
