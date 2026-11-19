<?php

namespace App\Http\Requests\Tourist;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTouristProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone_number' => ['required', 'string', 'regex:/^0[35789][0-9]{8}$/'],
            'gender' => ['required', 'string', 'in:male,female,other'],
            'date_of_birth' => ['required', 'date', 'before:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Vui lòng nhập họ và tên.',
            'name.string' => 'Họ và tên phải là chuỗi ký tự hợp lệ.',
            'name.max' => 'Họ và tên không được vượt quá 255 ký tự.',
            'phone_number.required' => 'Vui lòng nhập số điện thoại.',
            'phone_number.string' => 'Số điện thoại phải là chuỗi ký tự hợp lệ.',
            'phone_number.regex' => 'Số điện thoại phải gồm đúng 10 chữ số di động Việt Nam hợp lệ (ví dụ: 0912345678).',
            'gender.required' => 'Vui lòng chọn giới tính.',
            'gender.string' => 'Giới tính phải là chuỗi ký tự hợp lệ.',
            'gender.in' => 'Giới tính không hợp lệ. Chỉ chấp nhận: male, female hoặc other.',
            'date_of_birth.required' => 'Vui lòng nhập ngày sinh.',
            'date_of_birth.date' => 'Ngày sinh không đúng định dạng ngày hợp lệ.',
            'date_of_birth.before' => 'Ngày sinh phải là một ngày trước hôm nay.',
        ];
    }
}
