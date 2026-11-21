<?php

namespace App\Http\Requests\Provider;

use Illuminate\Foundation\Http\FormRequest;

class UpsertAvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dates' => ['nullable', 'array', 'min:1'],
            'dates.*' => ['date', 'after_or_equal:today'],
            'start_date' => ['required_without:dates', 'nullable', 'date', 'after_or_equal:today'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'days_of_week' => ['nullable', 'array'],
            'days_of_week.*' => ['integer', 'between:0,6'],
            'total_slots' => ['required', 'integer', 'min:0'],
            'price_override' => ['nullable', 'numeric', 'min:0'],
            'is_blocked' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'start_date.required_without' => 'Vui lòng chọn ngày bắt đầu hoặc danh sách ngày cần cấu hình.',
            'start_date.after_or_equal' => 'Ngày cấu hình phải từ hôm nay trở đi.',
            'end_date.after_or_equal' => 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.',
            'total_slots.required' => 'Vui lòng nhập số lượng chỗ mở bán.',
            'total_slots.min' => 'Số lượng chỗ không được âm.',
            'is_blocked.required' => 'Vui lòng xác định trạng thái đóng/mở bán.',
        ];
    }
}
