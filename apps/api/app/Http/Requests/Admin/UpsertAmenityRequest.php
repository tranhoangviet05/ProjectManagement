<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpsertAmenityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $slug = trim((string) $this->input('slug', ''));
        $name = trim((string) $this->input('name', ''));
        $scope = trim((string) $this->input('scope', 'service'));

        $this->merge([
            'name' => $name,
            'slug' => $slug !== '' ? Str::slug($slug) : ($name !== '' ? Str::slug($scope.'-'.$name) : ''),
            'scope' => $scope ?: 'service',
            'icon' => trim((string) $this->input('icon', 'sparkles')) ?: 'sparkles',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $amenityId = $this->route('id');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('amenities', 'slug')->ignore($amenityId),
            ],
            'scope' => ['required', 'string', Rule::in(['service', 'room'])],
            'applicable_types' => ['required', 'array', 'min:1'],
            'applicable_types.*' => ['string', Rule::in(['hotel', 'homestay', 'tour', 'vehicle', 'train'])],
            'icon' => ['required', 'string', 'max:80'],
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
            'name.required' => 'Vui lòng nhập tên tiện nghi.',
            'slug.unique' => 'Slug tiện nghi này đã tồn tại trên hệ thống.',
            'scope.in' => 'Phạm vi tiện nghi phải là service hoặc room.',
            'applicable_types.required' => 'Vui lòng chọn ít nhất một loại hình dịch vụ áp dụng.',
            'applicable_types.min' => 'Vui lòng chọn ít nhất một loại hình dịch vụ áp dụng.',
        ];
    }
}
