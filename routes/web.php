<?php

use App\Http\Controllers\SiteController;
use Illuminate\Support\Facades\Route;

Route::get('/', [SiteController::class, 'index'])->name('home');


Route::resource('sites', SiteController::class)->except(['show']);

Route::post('sites/{site}/deploy', [SiteController::class, 'deploy'])->name('sites.deploy');

Route::post('sites/{site}/stop', [SiteController::class, 'stop'])->name('sites.stop');
