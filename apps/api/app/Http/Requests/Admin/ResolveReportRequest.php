<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ResolveReportRequest extends FormRequest
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
            'action' => ['required', 'string', 'in:hide,dismiss'],
            'resolution_note' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'action.required' => 'Vui lòng chọn hành động xử lý báo cáo.',
            'action.in' => 'Hành động xử lý chỉ hỗ trợ ẩn nội dung (hide) hoặc bỏ qua (dismiss).',
            'resolution_note.max' => 'Ghi chú xử lý không được vượt quá 500 ký tự.',
        ];
    }
}
