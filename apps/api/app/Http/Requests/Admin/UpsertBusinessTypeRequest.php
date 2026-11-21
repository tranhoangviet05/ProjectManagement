<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpsertBusinessTypeRequest extends FormRequest
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
            'type' => trim((string) $this->input('type', '')),
            'name' => $name,
            'slug' => $slug !== '' ? Str::slug($slug) : ($name !== '' ? Str::slug($name) : ''),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $businessTypeId = $this->route('id');

        return [
            'type' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:100'],
            'slug' => [
                'required',
                'string',
                'max:100',
                'alpha_dash',
                Rule::unique('business_types', 'slug')->ignore($businessTypeId),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'type.required' => 'Vui lòng chọn nhóm phân loại lớn (Chỗ ở, Giải trí, Di chuyển...).',
            'name.required' => 'Vui lòng nhập tên loại hình kinh doanh.',
            'slug.required' => 'Vui lòng nhập slug loại hình.',
            'slug.unique' => 'Slug loại hình kinh doanh này đã tồn tại.',
            'slug.alpha_dash' => 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang (-).',
        ];
    }
}
