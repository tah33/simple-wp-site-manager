<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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
            'domain'            => 'required|string',
            'server_ip'         => 'required|ip',
            'server_port'       => 'required|integer|between:1,65535',
            'server_username'   => 'required|string',
            'auth_method'       => 'required',
            'ssh_password'      => 'required_without:ssh_private_key',
            'ssh_private_key'   => 'required_without:ssh_password',
            'http_port'         => 'required|integer|between:1,65535',
            'wp_admin_user'     => 'required|string',
            'wp_admin_email'    => 'required|email',
            'wp_admin_password' => 'required|min:8',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            // Get the site ID for update (will be null for create)
            $siteId = $this->route('site')?->id ?? null;

            // Check if HTTP port conflicts with ANY port (http or https) on the same server
            $httpPortConflict = \App\Models\Site::where('http_port', $this->http_port)
                ->whereHas('server', function ($query) {
                    $query->where('server_ip', $this->server_ip);
                })
                ->when($siteId, function ($query) use ($siteId) {
                    return $query->where('id', '!=', $siteId);
                })
                ->exists();

            if ($httpPortConflict) {
                $validator->errors()->add('http_port', 'The HTTP port is already in use on this server.');
            }
        });
    }
}
