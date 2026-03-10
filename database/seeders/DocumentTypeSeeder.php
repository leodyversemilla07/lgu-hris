<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use Illuminate\Database\Seeder;

class DocumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $documentTypes = [
            ['code' => 'APPT', 'name' => 'Appointment Paper', 'is_confidential' => false],
            ['code' => 'PDS', 'name' => 'Personal Data Sheet', 'is_confidential' => false],
            ['code' => 'SR', 'name' => 'Service Record', 'is_confidential' => false],
            ['code' => 'MEDCERT', 'name' => 'Medical Certificate', 'is_confidential' => true],
            ['code' => 'GOVID', 'name' => 'Government-Issued ID', 'is_confidential' => false],
            ['code' => 'COE', 'name' => 'Certificate of Employment', 'is_confidential' => false],
            ['code' => 'IPCR', 'name' => 'Individual Performance Commitment and Review', 'is_confidential' => false],
            ['code' => 'SALN', 'name' => 'Statement of Assets, Liabilities and Net Worth', 'is_confidential' => true],
            ['code' => 'TRAINCERT', 'name' => 'Training/Seminar Certificate', 'is_confidential' => false],
            ['code' => 'OATH', 'name' => 'Oath of Office', 'is_confidential' => false],
        ];

        foreach ($documentTypes as $documentType) {
            DocumentType::query()->updateOrCreate(
                ['code' => $documentType['code']],
                [
                    'name' => $documentType['name'],
                    'description' => $documentType['name'],
                    'is_confidential' => $documentType['is_confidential'],
                    'is_active' => true,
                ],
            );
        }
    }
}
