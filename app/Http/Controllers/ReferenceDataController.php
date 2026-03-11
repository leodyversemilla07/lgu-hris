<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\DocumentType;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\LeaveType;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReferenceDataController extends Controller
{
    public function index(): Response
    {
        $departments = Department::orderBy('name')
            ->get(['id', 'code', 'name', 'is_active'])
            ->map(fn (Department $d): array => [
                'id' => $d->id,
                'code' => $d->code,
                'name' => $d->name,
                'is_active' => (bool) $d->is_active,
            ]);

        $positions = Position::with('department:id,name')
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'department_id', 'is_active'])
            ->map(fn (Position $p): array => [
                'id' => $p->id,
                'code' => $p->code,
                'name' => $p->name,
                'department_id' => $p->department_id,
                'department_name' => $p->department?->name ?? '—',
                'is_active' => (bool) $p->is_active,
            ]);

        $employmentTypes = EmploymentType::orderBy('name')
            ->get(['id', 'code', 'name', 'is_active'])
            ->map(fn (EmploymentType $et): array => [
                'id' => $et->id,
                'code' => $et->code,
                'name' => $et->name,
                'is_active' => (bool) $et->is_active,
            ]);

        $employmentStatuses = EmploymentStatus::orderBy('name')
            ->get(['id', 'code', 'name', 'is_active'])
            ->map(fn (EmploymentStatus $es): array => [
                'id' => $es->id,
                'code' => $es->code,
                'name' => $es->name,
                'is_active' => (bool) $es->is_active,
            ]);

        $leaveTypes = LeaveType::orderBy('name')
            ->get()
            ->map(fn (LeaveType $lt): array => [
                'id' => $lt->id,
                'code' => $lt->code,
                'name' => $lt->name,
                'max_days_per_year' => (int) $lt->max_days_per_year,
                'requires_approval' => (bool) $lt->requires_approval,
                'is_active' => (bool) $lt->is_active,
            ]);

        $documentTypes = DocumentType::orderBy('name')
            ->get()
            ->map(fn (DocumentType $dt): array => [
                'id' => $dt->id,
                'code' => $dt->code,
                'name' => $dt->name,
                'is_confidential' => (bool) $dt->is_confidential,
                'is_active' => (bool) $dt->is_active,
            ]);

        return Inertia::render('reference-data/index', [
            'departments' => $departments,
            'positions' => $positions,
            'employmentTypes' => $employmentTypes,
            'employmentStatuses' => $employmentStatuses,
            'leaveTypes' => $leaveTypes,
            'documentTypes' => $documentTypes,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        match ($request->input('type')) {
            'department' => $this->storeDepartment($request),
            'position' => $this->storePosition($request),
            'employment_type' => $this->storeEmploymentType($request),
            'employment_status' => $this->storeEmploymentStatus($request),
            'leave_type' => $this->storeLeaveType($request),
            'document_type' => $this->storeDocumentType($request),
            default => abort(422, 'Unknown reference type.'),
        };

        return to_route('reference-data.index')
            ->with('success', 'Record created successfully.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        match ($request->input('type')) {
            'department' => $this->updateDepartment($request, $id),
            'position' => $this->updatePosition($request, $id),
            'employment_type' => $this->updateEmploymentType($request, $id),
            'employment_status' => $this->updateEmploymentStatus($request, $id),
            'leave_type' => $this->updateLeaveType($request, $id),
            'document_type' => $this->updateDocumentType($request, $id),
            default => abort(422, 'Unknown reference type.'),
        };

        return to_route('reference-data.index')
            ->with('success', 'Record updated successfully.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $model = match ($request->input('type')) {
            'department' => Department::findOrFail($id),
            'position' => Position::findOrFail($id),
            'employment_type' => EmploymentType::findOrFail($id),
            'employment_status' => EmploymentStatus::findOrFail($id),
            'leave_type' => LeaveType::findOrFail($id),
            'document_type' => DocumentType::findOrFail($id),
            default => abort(422, 'Unknown reference type.'),
        };

        $model->update(['is_active' => false]);

        return to_route('reference-data.index')
            ->with('success', 'Record deactivated.');
    }

    // ─── Store helpers ────────────────────────────────────────────────────────

    private function storeDepartment(Request $request): void
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:20'],
        ]);

        Department::create(array_merge($data, ['is_active' => true]));
    }

    private function storePosition(Request $request): void
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:20'],
            'department_id' => ['required', 'integer', 'exists:departments,id'],
        ]);

        Position::create(array_merge($data, ['is_active' => true]));
    }

    private function storeEmploymentType(Request $request): void
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:20'],
        ]);

        EmploymentType::create(array_merge($data, ['is_active' => true]));
    }

    private function storeEmploymentStatus(Request $request): void
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:20'],
        ]);

        EmploymentStatus::create(array_merge($data, ['is_active' => true]));
    }

    private function storeLeaveType(Request $request): void
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:20'],
            'max_days_per_year' => ['required', 'integer', 'min:0'],
            'requires_approval' => ['boolean'],
        ]);

        LeaveType::create(array_merge($data, ['is_active' => true]));
    }

    private function storeDocumentType(Request $request): void
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:20'],
            'is_confidential' => ['boolean'],
        ]);

        DocumentType::create(array_merge($data, ['is_active' => true]));
    }

    // ─── Update helpers ───────────────────────────────────────────────────────

    private function updateDepartment(Request $request, int $id): void
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:20'],
            'is_active' => ['required', 'boolean'],
        ]);

        Department::findOrFail($id)->update($data);
    }

    private function updatePosition(Request $request, int $id): void
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:20'],
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'is_active' => ['required', 'boolean'],
        ]);

        Position::findOrFail($id)->update($data);
    }

    private function updateEmploymentType(Request $request, int $id): void
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:20'],
            'is_active' => ['required', 'boolean'],
        ]);

        EmploymentType::findOrFail($id)->update($data);
    }

    private function updateEmploymentStatus(Request $request, int $id): void
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:20'],
            'is_active' => ['required', 'boolean'],
        ]);

        EmploymentStatus::findOrFail($id)->update($data);
    }

    private function updateLeaveType(Request $request, int $id): void
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:20'],
            'max_days_per_year' => ['required', 'integer', 'min:0'],
            'requires_approval' => ['boolean'],
            'is_active' => ['required', 'boolean'],
        ]);

        LeaveType::findOrFail($id)->update($data);
    }

    private function updateDocumentType(Request $request, int $id): void
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:20'],
            'is_confidential' => ['boolean'],
            'is_active' => ['required', 'boolean'],
        ]);

        DocumentType::findOrFail($id)->update($data);
    }
}
