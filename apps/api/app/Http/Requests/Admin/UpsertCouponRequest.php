<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('code') && is_string($this->input('code'))) {
            $this->merge([
                'code' => strtoupper(trim($this->input('code'))),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $couponId = $this->route('id');
        $type = $this->input('type');

        $discountRules = ['required', 'numeric', 'min:1'];
        if ($type === 'percent') {
            $discountRules[] = 'max:100';
        }

        return [
            'code' => [
                'required',
                'string',
                'max:50',
                'alpha_dash',
                Rule::unique('coupons', 'code')->ignore($couponId),
            ],
            'type' => ['required', 'string', 'in:percent,fixed'],
            'discount_value' => $discountRules,
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'per_user_limit' => ['required', 'integer', 'min:1'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after:valid_from'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'code.required' => 'Vui lòng nhập mã ưu đãi.',
            'code.unique' => 'Mã ưu đãi này đã tồn tại trên hệ thống.',
            'code.alpha_dash' => 'Mã ưu đãi chỉ gồm chữ, số, dấu gạch ngang (-) hoặc gạch dưới (_).',
            'type.in' => 'Loại giảm giá chỉ hỗ trợ phần trăm (percent) hoặc số tiền cố định (fixed).',
            'discount_value.required' => 'Vui lòng nhập giá trị giảm.',
            'discount_value.min' => 'Giá trị giảm phải lớn hơn 0.',
            'discount_value.max' => 'Mức giảm theo phần trăm không được vượt quá 100%.',
            'per_user_limit.required' => 'Vui lòng nhập giới hạn lượt dùng cho mỗi khách hàng.',
            'valid_until.after' => 'Thời gian kết thúc phải sau thời gian bắt đầu.',
        ];
    }
}
