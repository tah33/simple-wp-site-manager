<?php

use App\Http\Controllers\SiteController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [SiteController::class, 'index'])->name('home');


Route::resource('sites', SiteController::class)->except(['show', 'edit', 'update']);
