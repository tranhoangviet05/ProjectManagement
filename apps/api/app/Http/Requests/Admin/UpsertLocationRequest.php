<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpsertLocationRequest extends FormRequest
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
            'country_code' => strtoupper(trim((string) $this->input('country_code', 'VN')) ?: 'VN'),
            'is_popular' => filter_var($this->input('is_popular', false), FILTER_VALIDATE_BOOLEAN),
            'parent_id' => $this->input('parent_id') ?: null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $locationId = $this->route('id');

        $parentRules = ['nullable', 'integer', 'exists:locations,id'];
        if ($locationId) {
            $parentRules[] = Rule::notIn([(int) $locationId]);
        }

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('locations', 'slug')->ignore($locationId),
            ],
            'parent_id' => $parentRules,
            'image_url' => ['nullable', 'string', 'max:1000'],
            'country_code' => ['required', 'string', 'max:10'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_popular' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Vui lòng nhập tên điểm đến.',
            'slug.required' => 'Vui lòng nhập đường dẫn (slug) hợp lệ.',
            'slug.unique' => 'Slug điểm đến này đã tồn tại trên hệ thống.',
            'slug.alpha_dash' => 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang (-).',
            'parent_id.not_in' => 'Không thể chọn chính điểm đến này làm khu vực cha.',
            'parent_id.exists' => 'Khu vực cha được chọn không tồn tại.',
        ];
    }
}
