<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UploadAvatarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'avatar' => ['required', 'file', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'avatar.required' => 'Vui lòng chọn tệp ảnh đại diện cần tải lên.',
            'avatar.file' => 'Tệp ảnh tải lên không hợp lệ.',
            'avatar.image' => 'Tệp tải lên phải là hình ảnh.',
            'avatar.mimes' => 'Ảnh đại diện chỉ chấp nhận định dạng: JPG, JPEG, PNG, WEBP.',
            'avatar.max' => 'Dung lượng ảnh đại diện không được vượt quá 2MB.',
        ];
    }
}
