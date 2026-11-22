<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpsertServicePolicyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $slug = trim((string) $this->input('slug', ''));
        $name = trim((string) $this->input('name', ''));
        $category = trim((string) $this->input('category', 'rules'));

        $this->merge([
            'name' => $name,
            'slug' => $slug !== '' ? Str::slug($slug) : ($name !== '' ? Str::slug($category.'-'.$name) : ''),
            'category' => $category ?: 'rules',
            'icon' => trim((string) $this->input('icon', 'shield-check')) ?: 'shield-check',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $policyId = $this->route('id');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('service_policies', 'slug')->ignore($policyId),
            ],
            'category' => ['required', 'string', Rule::in(['payment', 'cancellation', 'checkin', 'rules'])],
            'applicable_types' => ['required', 'array', 'min:1'],
            'applicable_types.*' => ['string', Rule::in(['hotel', 'homestay', 'tour', 'vehicle', 'train'])],
            'icon' => ['required', 'string', 'max:80'],
            'description' => ['nullable', 'string', 'max:1500'],
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
            'name.required' => 'Vui lòng nhập tên chính sách.',
            'slug.unique' => 'Slug chính sách này đã tồn tại trên hệ thống.',
            'category.in' => 'Nhóm chính sách không hợp lệ.',
            'applicable_types.required' => 'Vui lòng chọn ít nhất một loại hình dịch vụ áp dụng.',
            'applicable_types.min' => 'Vui lòng chọn ít nhất một loại hình dịch vụ áp dụng.',
        ];
    }
}
