<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;

class CreateInitialAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hris:create-admin
                            {--name= : Full name for the initial HR admin}
                            {--email= : Email address for the initial HR admin}
                            {--password= : Password for the initial HR admin}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create the initial HR Admin account for a production deployment';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (! Role::query()->where('name', 'HR Admin')->exists()) {
            $this->error('The HR Admin role is missing. Run the production seeders first.');

            return self::FAILURE;
        }

        $name = $this->resolveName();
        $email = $this->resolveEmail();
        $password = $this->resolvePassword();

        $validator = Validator::make(
            [
                'name' => $name,
                'email' => $email,
                'password' => $password,
            ],
            [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
                'password' => ['required', 'string', 'min:8'],
            ],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $user = User::query()->create([
            'name' => $name,
            'email' => $email,
            'password' => $password,
        ]);
        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        $user->syncRoles(['HR Admin']);

        $this->info("Created HR Admin account for {$user->email}.");

        return self::SUCCESS;
    }

    private function resolveName(): string
    {
        return trim((string) ($this->option('name') ?: $this->ask('Admin full name')));
    }

    private function resolveEmail(): string
    {
        return trim((string) ($this->option('email') ?: $this->ask('Admin email address')));
    }

    private function resolvePassword(): string
    {
        $providedPassword = $this->option('password');

        if (is_string($providedPassword) && $providedPassword !== '') {
            return $providedPassword;
        }

        return (string) $this->secret('Admin password (minimum 8 characters)');
    }
}
