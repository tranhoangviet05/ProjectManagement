<?php

namespace App\Http\Requests\Provider;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProviderProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_name' => ['required', 'string', 'max:255'],
            'representative_name' => ['nullable', 'string', 'max:255'],
            'business_type_id' => ['nullable', 'integer', 'exists:business_types,id'],
            'phone' => ['nullable', 'string', 'regex:/^(84|0[3|5|7|8|9])+([0-9]{8})$/'],
            'address' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'business_name.required' => 'Vui lòng nhập tên cơ sở kinh doanh / thương hiệu du lịch.',
            'business_name.max' => 'Tên cơ sở kinh doanh không được vượt quá 255 ký tự.',
            'business_type_id.exists' => 'Loại hình kinh doanh không hợp lệ trong hệ thống.',
            'phone.regex' => 'Số điện thoại không đúng định dạng di động Việt Nam hợp lệ (ví dụ: 0912345678).',
            'address.max' => 'Địa chỉ không được vượt quá 500 ký tự.',
            'description.max' => 'Mô tả cơ sở không được vượt quá 1000 ký tự.',
        ];
    }
}
