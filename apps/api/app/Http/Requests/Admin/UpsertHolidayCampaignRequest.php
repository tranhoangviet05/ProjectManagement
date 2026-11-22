<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpsertHolidayCampaignRequest extends FormRequest
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
        $campaignId = $this->route('id');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('holiday_campaigns', 'slug')->ignore($campaignId),
            ],
            'badge_text' => ['nullable', 'string', 'max:80'],
            'banner_url' => ['nullable', 'string', 'max:1000'],
            'description' => ['nullable', 'string', 'max:2000'],
            'discount_type' => ['required', 'string', Rule::in(['percent', 'fixed'])],
            'discount_value' => ['required', 'numeric', 'min:1'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'priority' => ['sometimes', 'integer', 'min:0'],
            'status' => ['required', 'string', Rule::in(['draft', 'active', 'ended'])],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Vui lòng nhập tên chương trình khuyến mãi.',
            'slug.unique' => 'Slug chương trình khuyến mãi đã tồn tại.',
            'discount_value.required' => 'Vui lòng nhập mức giảm giá mặc định.',
            'discount_value.min' => 'Mức giảm giá phải lớn hơn 0.',
            'starts_at.required' => 'Vui lòng chọn thời gian bắt đầu.',
            'ends_at.required' => 'Vui lòng chọn thời gian kết thúc.',
            'ends_at.after' => 'Thời gian kết thúc phải sau thời gian bắt đầu.',
        ];
    }
}
