<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpsertServiceInclusionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $slug = trim((string) $this->input('slug', ''));
        $name = trim((string) $this->input('name', ''));
        $kind = trim((string) $this->input('kind', 'include'));

        $this->merge([
            'name' => $name,
            'slug' => $slug !== '' ? Str::slug($slug) : ($name !== '' ? Str::slug($kind.'-'.$name) : ''),
            'kind' => $kind ?: 'include',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $inclusionId = $this->route('id');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('service_inclusions', 'slug')->ignore($inclusionId),
            ],
            'kind' => ['required', 'string', Rule::in(['include', 'exclude'])],
            'applicable_types' => ['required', 'array', 'min:1'],
            'applicable_types.*' => ['string', Rule::in(['hotel', 'homestay', 'tour', 'vehicle', 'train'])],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Vui lòng nhập nội dung mục.',
            'slug.unique' => 'Slug mục này đã tồn tại trên hệ thống.',
            'kind.in' => 'Loại mục phải là include hoặc exclude.',
            'applicable_types.required' => 'Vui lòng chọn ít nhất một loại hình dịch vụ áp dụng.',
            'applicable_types.min' => 'Vui lòng chọn ít nhất một loại hình dịch vụ áp dụng.',
        ];
    }
}
