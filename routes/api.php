<?php


use App\Http\Controllers\API\SiteStatusController;

Route::post('/site-status', [SiteStatusController::class, 'siteStatus'])
    ->name('api.site-status.update');
