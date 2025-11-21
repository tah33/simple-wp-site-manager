<?php

namespace App\Http\Controllers;

use App\Http\Requests\SiteRequest;
use App\Http\Resources\SiteResource;
use App\Models\Site;
use App\Repositories\SiteRepository;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SiteController extends Controller
{
    public function __construct(protected SiteRepository $siteRepository)
    {

    }
    public function index()
    {
        $sites                  = $this->siteRepository->index();
        $data                   = [
            'sites'             => SiteResource::collection($sites)->resolve(),
            'pagination'        => [
                'current_page'  => $sites->currentPage(),
                'last_page'     => $sites->lastPage(),
                'per_page'      => $sites->perPage(),
                'total'         => $sites->total(),
            ]
        ];
        return Inertia::render('Sites/Index', $data);
    }

    public function create()
    {
        return Inertia::render('Sites/Create', []);
    }

    public function store(SiteRequest $request)
    {
        try {
            $data = $request->validated();
            $this->siteRepository->store($data);
            return redirect()->route('sites.index');
        } catch (\Exception $e) {
            Log::info($e);
            return back()
                ->withInput()
                ->with('error', 'Failed to create site: ' . $e->getMessage());
        }
    }

    public function destroy(Site $site)
    {
        return $this->siteRepository->delete($site);
    }
}
