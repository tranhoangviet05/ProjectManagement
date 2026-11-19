<?php

namespace App\Http\Requests\Provider;

use Illuminate\Foundation\Http\FormRequest;

class UploadServiceMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'files' => ['required', 'array', 'min:1', 'max:15'],
            'files.*' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,mp4', 'max:10240'],
            'cover_index' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'files.required' => 'Vui lòng chọn ít nhất một tệp ảnh hoặc video.',
            'files.max' => 'Chỉ có thể tải lên tối đa 15 tệp mỗi lần.',
            'files.*.mimes' => 'Tệp tải lên phải có định dạng JPG, JPEG, PNG, WEBP hoặc MP4.',
            'files.*.max' => 'Dung lượng mỗi tệp không được vượt quá 10MB.',
        ];
    }
}
