<?php

namespace App\Http\Controllers;

use App\Http\Requests\WorkScheduleStoreRequest;
use App\Http\Requests\WorkScheduleUpdateRequest;
use App\Models\WorkSchedule;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class WorkScheduleController extends Controller
{
    public function index(): Response
    {
        $schedules = WorkSchedule::query()
            ->withCount('employees')
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->get()
            ->map(fn (WorkSchedule $workSchedule): array => [
                'id' => $workSchedule->id,
                'name' => $workSchedule->name,
                'time_in' => substr($workSchedule->time_in, 0, 5),
                'time_out' => substr($workSchedule->time_out, 0, 5),
                'break_minutes' => $workSchedule->break_minutes,
                'work_hours_per_day' => (float) $workSchedule->work_hours_per_day,
                'is_active' => $workSchedule->is_active,
                'employees_count' => $workSchedule->employees_count,
                'updated_at' => $workSchedule->updated_at->format('M d, Y'),
            ]);

        return Inertia::render('work-schedules/index', [
            'schedules' => $schedules,
        ]);
    }

    public function store(WorkScheduleStoreRequest $request): RedirectResponse
    {
        WorkSchedule::query()->create([
            ...$request->validated(),
            'name' => $request->string('name')->trim()->value(),
            'time_in' => $request->input('time_in').':00',
            'time_out' => $request->input('time_out').':00',
            'is_active' => true,
        ]);

        return to_route('work-schedules.index')
            ->with('success', 'Work schedule created successfully.');
    }

    public function update(WorkScheduleUpdateRequest $request, WorkSchedule $workSchedule): RedirectResponse
    {
        $workSchedule->update([
            ...$request->validated(),
            'name' => $request->string('name')->trim()->value(),
            'time_in' => $request->input('time_in').':00',
            'time_out' => $request->input('time_out').':00',
        ]);

        return to_route('work-schedules.index')
            ->with('success', 'Work schedule updated successfully.');
    }

    public function destroy(WorkSchedule $workSchedule): RedirectResponse
    {
        $workSchedule->update(['is_active' => false]);

        return to_route('work-schedules.index')
            ->with('success', 'Work schedule deactivated.');
    }
}
