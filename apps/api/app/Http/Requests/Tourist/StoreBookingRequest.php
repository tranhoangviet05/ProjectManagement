<?php

namespace App\Http\Requests\Tourist;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookingRequest extends FormRequest
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
        $isGuest = $this->user() === null;

        return [
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'room_type_id' => ['nullable', 'integer'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:50'],
            'deposit_rate' => ['nullable', 'integer', Rule::in([0, 30, 100])],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'contact_name' => ['required', 'string', 'max:255'],
            'contact_phone' => ['required', 'string', 'max:20'],
            'contact_email' => [$isGuest ? 'required' : 'nullable', 'email', 'max:255'],
            'special_requests' => ['nullable', 'string', 'max:1000'],
            'metadata' => ['nullable', 'array'],
            'metadata.num_adults' => ['nullable', 'integer', 'min:1', 'max:50'],
            'metadata.num_children' => ['nullable', 'integer', 'min:0', 'max:50'],
            'metadata.has_pets' => ['nullable', 'boolean'],
            'metadata.pickup_location' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'service_id.required' => 'Vui lòng chọn dịch vụ muốn đặt.',
            'start_date.required' => 'Vui lòng chọn ngày bắt đầu / nhận dịch vụ.',
            'start_date.after_or_equal' => 'Ngày bắt đầu phải từ hôm nay trở đi.',
            'contact_name.required' => 'Vui lòng nhập họ tên người liên hệ.',
            'contact_phone.required' => 'Vui lòng nhập số điện thoại liên hệ.',
            'contact_email.required' => 'Khách đặt không đăng nhập vui lòng cung cấp email để nhận mã vé.',
        ];
    }
}
