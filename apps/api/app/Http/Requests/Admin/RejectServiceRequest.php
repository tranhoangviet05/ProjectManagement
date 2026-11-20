<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RejectServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rejection_reason' => ['required', 'string', 'min:10', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'rejection_reason.required' => 'Vui lòng nhập lý do từ chối dịch vụ.',
            'rejection_reason.min' => 'Lý do từ chối phải có ít nhất 10 ký tự để đối tác nắm rõ nguyên nhân.',
            'rejection_reason.max' => 'Lý do từ chối không được vượt quá 1000 ký tự.',
        ];
    }
}
