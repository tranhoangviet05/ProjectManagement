<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpsertCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $slug = trim((string) $this->input('slug', ''));
        $name = trim((string) $this->input('name', ''));

        $this->merge([
            'name' => $name,
            'slug' => $slug !== '' ? Str::slug($slug) : ($name !== '' ? Str::slug($name) : ''),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $categoryId = $this->route('id');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('categories', 'slug')->ignore($categoryId),
            ],
            'applicable_types' => ['required', 'array', 'min:1'],
            'applicable_types.*' => ['string', Rule::in(['hotel', 'homestay', 'tour', 'vehicle', 'train'])],
            'icon' => ['nullable', 'string', 'max:100'],
            'icon_url' => ['nullable', 'string', 'max:1000'],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Vui lòng nhập tên danh mục.',
            'slug.required' => 'Vui lòng nhập slug danh mục.',
            'slug.unique' => 'Slug danh mục này đã tồn tại trên hệ thống.',
            'slug.alpha_dash' => 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang (-).',
            'applicable_types.required' => 'Vui lòng chọn ít nhất một loại hình dịch vụ áp dụng.',
            'applicable_types.min' => 'Vui lòng chọn ít nhất một loại hình dịch vụ áp dụng.',
        ];
    }
}
