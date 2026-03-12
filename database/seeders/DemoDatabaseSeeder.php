<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DemoDatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with reference and demo data.
     */
    public function run(): void
    {
        $this->call(DatabaseSeeder::class);
        $this->call(DemoDataSeeder::class);
    }
}
