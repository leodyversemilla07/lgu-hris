<?php

namespace App\Console\Commands;

use App\Models\CentralUser;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

class MakeCentralAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'central:make-admin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a super admin user for the central SaaS panel';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Creating Central Admin User');

        $name = text('Name', required: true);
        $email = text('Email', required: true, validate: fn (string $value) => match (true) {
            ! filter_var($value, FILTER_VALIDATE_EMAIL) => 'The email address must be valid.',
            CentralUser::where('email', $value)->exists() => 'A central admin with this email already exists.',
            default => null
        });
        
        $passwordValue = password('Password', required: true);

        CentralUser::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($passwordValue),
            'email_verified_at' => now(),
        ]);

        $this->info('Central admin created successfully!');
    }
}
