<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiteResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'domain'            => $this->domain,
            'server_ip'         => $this->server->server_ip,
            'http_port'         => $this->http_port,
            'https_port'        => $this->https_port,
            'status'            => $this->status,
            'status_color'      => $this->status_color,
            'last_deployed_at'  => $this->last_deployed_at,
            'created_at'        => $this->created_at,
        ];
    }
}
