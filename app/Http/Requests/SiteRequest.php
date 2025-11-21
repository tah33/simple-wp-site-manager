<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SiteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'domain'            => 'required|string|unique:sites,domain',
            'server_ip'         => 'required|ip',
            'server_port'       => 'required|integer|between:1,65535',
            'server_username'   => 'required|string',
            'auth_method'       => 'required',
            'ssh_password'      => 'required_without:ssh_private_key',
            'ssh_private_key'   => 'required_without:ssh_password',
            'http_port'         => 'required|integer|between:1,65535',
            'https_port'        => 'required|integer|between:1,65535',
            'wp_admin_user'     => 'required|string',
            'wp_admin_email'    => 'required|email',
            'wp_admin_password' => 'required|min:8',
        ];
    }
}
