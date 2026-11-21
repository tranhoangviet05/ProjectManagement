<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserStatusRequest extends FormRequest
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
            'status' => ['required', 'string', 'in:active,banned'],
            'reason' => ['required_if:status,banned', 'nullable', 'string', 'min:10', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.required' => 'Vui lòng chọn trạng thái tài khoản mới.',
            'status.in' => 'Trạng thái tài khoản chỉ hỗ trợ kích hoạt (active) hoặc khóa (banned).',
            'reason.required_if' => 'Vui lòng nhập lý do khóa tài khoản.',
            'reason.min' => 'Lý do khóa tài khoản phải có ít nhất 10 ký tự.',
            'reason.max' => 'Lý do khóa tài khoản không được vượt quá 500 ký tự.',
        ];
    }
}
