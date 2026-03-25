<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('hris:backup')
    ->dailyAt((string) config('hris.backup.schedule_time', '01:00'))
    ->withoutOverlapping();

Schedule::command('hris:add-monthly-leave-credits')
    ->monthlyOn(1, '00:00')
    ->withoutOverlapping();
