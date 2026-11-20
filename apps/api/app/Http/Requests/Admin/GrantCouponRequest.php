<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class GrantCouponRequest extends FormRequest
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
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['required', 'integer', 'exists:users,id'],
            'note' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'user_ids.required' => 'Vui lòng chọn ít nhất 1 khách du lịch để tặng mã.',
            'user_ids.min' => 'Vui lòng chọn ít nhất 1 khách du lịch để tặng mã.',
            'user_ids.*.exists' => 'Một hoặc nhiều tài khoản được chọn không tồn tại.',
            'note.max' => 'Ghi chú tặng mã không được vượt quá 255 ký tự.',
        ];
    }
}
