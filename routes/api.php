<?php


Route::post('/site-status', [SiteStatusController::class, 'update'])
    ->name('api.site-status.update');
