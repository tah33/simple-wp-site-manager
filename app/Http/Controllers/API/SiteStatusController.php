<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Site;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SiteStatusController extends Controller
{
    public function siteStatus(Request $request)
    {
        Log::info('data', [$request->all(), $request->header()]);

        $valid_token = config('app.monitor_token');
        $provided_token = $request->bearerToken();

        if ($provided_token !== $valid_token) {
            Log::warning('Invalid monitor token provided');
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'domain'            => 'required|string',
            'status'            => 'required|string|in:running,stopped,failed,deploying',
            'container_name'    => 'required|string'
        ]);

        try {
            $site = Site::where('domain', $validated['domain'])->first();

            if ($site) {
                // Update site status
                $site->update([
                    'status' => $validated['status'],
                    'updated_at' => now() // Force update timestamp
                ]);

                Log::info("Site status updated: {$validated['domain']} -> {$validated['status']}");

                return response()->json([
                    'success' => true,
                    'message' => 'Status updated successfully'
                ]);
            } else {
                Log::warning("Site not found for domain: {$validated['domain']}");
                return response()->json([
                    'success' => false,
                    'message' => 'Site not found'
                ], 404);
            }
        } catch (\Exception $e) {
            Log::error("Failed to update site status: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }
}
