<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InstallationController extends Controller
{
    protected array $steps = [
        1 => 'Welcome',
        2 => 'Requirements',
        3 => 'Database',
        4 => 'Environment',
        5 => 'Migrations',
        6 => 'Admin',
    ];

    public function index(): Response|RedirectResponse
    {
        if ($this->isInstalled()) {
            return redirect('/');
        }

        return Inertia::render('installation/index', [
            'currentStep' => 1,
            'steps' => $this->steps,
        ]);
    }

    protected function isInstalled(): bool
    {
        $envPath = base_path('.env');

        if (! File::exists($envPath)) {
            return false;
        }

        return str_contains(File::get($envPath), 'APP_INSTALLED=true');
    }

    public function requirements(): Response|RedirectResponse
    {
        if ($this->isInstalled()) {
            return redirect('/');
        }

        $results = $this->checkRequirements();

        return Inertia::render('installation/requirements', [
            'currentStep' => 2,
            'steps' => $this->steps,
            'results' => $results,
            'passed' => $results['overall'],
        ]);
    }

    protected function checkRequirements(): array
    {
        $checks = [];

        $requirements = [
            'PHP >= 8.4' => PHP_VERSION_ID >= 80400,
            'BCMath' => extension_loaded('bcmath'),
            'Ctype' => extension_loaded('ctype'),
            'JSON' => extension_loaded('json'),
            'Mbstring' => extension_loaded('mbstring'),
            'OpenSSL' => extension_loaded('openssl'),
            'PDO' => extension_loaded('pdo'),
            'Tokenizer' => extension_loaded('tokenizer'),
            'XML' => extension_loaded('xml'),
            'Fileinfo' => extension_loaded('fileinfo'),
            'GD' => extension_loaded('gd'),
            'cURL' => extension_loaded('curl'),
            'ZIP' => extension_loaded('zip'),
        ];

        foreach ($requirements as $label => $pass) {
            $checks[] = ['label' => $label, 'passed' => $pass, 'type' => 'requirement'];
        }

        $permissions = [
            'storage/ directory' => is_writable(storage_path()),
            'storage/framework/' => is_writable(storage_path('framework')),
            'storage/logs/' => is_writable(storage_path('logs')),
            'bootstrap/cache/' => is_writable(base_path('bootstrap/cache')),
            '.env file' => File::exists(base_path('.env')) ? is_writable(base_path('.env')) : is_writable(base_path()),
        ];

        foreach ($permissions as $label => $pass) {
            $checks[] = ['label' => $label, 'passed' => $pass, 'type' => 'permission'];
        }

        $overall = collect($checks)->every(fn ($check) => $check['passed']);

        return ['checks' => $checks, 'overall' => $overall];
    }

    public function database(): Response|RedirectResponse
    {
        if ($this->isInstalled()) {
            return redirect('/');
        }

        return Inertia::render('installation/database', [
            'currentStep' => 3,
            'steps' => $this->steps,
            'connection' => config('database.default'),
            'connections' => [
                ['value' => 'mysql', 'label' => 'MySQL'],
                ['value' => 'pgsql', 'label' => 'PostgreSQL'],
                ['value' => 'sqlite', 'label' => 'SQLite'],
            ],
        ]);
    }

    public function testDatabase(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'connection' => ['required', 'string', 'in:mysql,pgsql,sqlite'],
            'host' => ['required_unless:connection,sqlite', 'nullable', 'string', 'max:255'],
            'port' => ['required_unless:connection,sqlite', 'nullable', 'integer', 'min:1', 'max:65535'],
            'database' => ['required', 'string', 'max:255'],
            'username' => ['required_unless:connection,sqlite', 'nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'max:255'],
        ]);

        if ($data['connection'] === 'sqlite') {
            $dbPath = database_path("{$data['database']}.sqlite");

            if (! File::exists($dbPath)) {
                File::put($dbPath, '');
            }

            try {
                DB::connection('sqlite')->getPdo();

                return back()->with('success', 'Database connection established.');
            } catch (\Exception $e) {
                return back()->withErrors(['database' => 'Could not connect: '.$e->getMessage()]);
            }
        }

        config([
            "database.connections.{$data['connection']}.host" => $data['host'],
            "database.connections.{$data['connection']}.port" => $data['port'],
            "database.connections.{$data['connection']}.database" => $data['database'],
            "database.connections.{$data['connection']}.username" => $data['username'],
            "database.connections.{$data['connection']}.password" => $data['password'],
        ]);

        try {
            DB::connection($data['connection'])->getPdo();

            return back()->with('success', 'Database connection established.');
        } catch (\Exception $e) {
            return back()->withErrors(['database' => 'Could not connect: '.$e->getMessage()]);
        }
    }

    public function saveDatabase(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'connection' => ['required', 'string', 'in:mysql,pgsql,sqlite'],
            'host' => ['required_unless:connection,sqlite', 'nullable', 'string', 'max:255'],
            'port' => ['required_unless:connection,sqlite', 'nullable', 'integer', 'min:1', 'max:65535'],
            'database' => ['required', 'string', 'max:255'],
            'username' => ['required_unless:connection,sqlite', 'nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'max:255'],
        ]);

        $envContent = File::get(base_path('.env'));

        $replacements = [
            'DB_CONNECTION' => $data['connection'],
            'DB_HOST' => $data['connection'] === 'sqlite' ? '' : ($data['host'] ?? '127.0.0.1'),
            'DB_PORT' => $data['connection'] === 'sqlite' ? '' : (string) ($data['port'] ?? 3306),
            'DB_DATABASE' => $data['database'],
            'DB_USERNAME' => $data['connection'] === 'sqlite' ? '' : ($data['username'] ?? 'root'),
            'DB_PASSWORD' => $data['connection'] === 'sqlite' ? '' : ($data['password'] ?? ''),
        ];

        foreach ($replacements as $key => $value) {
            $pattern = "/^{$key}=.*/m";
            $replacement = "{$key}={$value}";

            if (preg_match($pattern, $envContent)) {
                $envContent = preg_replace($pattern, $replacement, $envContent);
            } else {
                $envContent .= "\n{$replacement}";
            }
        }

        File::put(base_path('.env'), $envContent);

        return redirect()->route('install.environment');
    }

    public function environment(): Response|RedirectResponse
    {
        if ($this->isInstalled()) {
            return redirect('/');
        }

        $appUrl = env('APP_URL', 'http://localhost');
        $appName = env('APP_NAME', 'LGU-HRIS');

        return Inertia::render('installation/environment', [
            'currentStep' => 4,
            'steps' => $this->steps,
            'appUrl' => $appUrl,
            'appName' => $appName,
        ]);
    }

    public function saveEnvironment(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'app_name' => ['required', 'string', 'max:255'],
            'app_url' => ['required', 'url', 'max:255'],
        ]);

        $envContent = File::get(base_path('.env'));

        $replacements = [
            'APP_NAME' => $data['app_name'],
            'APP_URL' => $data['app_url'],
        ];

        foreach ($replacements as $key => $value) {
            $pattern = "/^{$key}=.*/m";
            $replacement = "{$key}={$value}";

            if (preg_match($pattern, $envContent)) {
                $envContent = preg_replace($pattern, $replacement, $envContent);
            } else {
                $envContent .= "\n{$replacement}";
            }
        }

        File::put(base_path('.env'), $envContent);

        return redirect()->route('install.migrations');
    }

    public function migrations(): Response|RedirectResponse
    {
        if ($this->isInstalled()) {
            return redirect('/');
        }

        $dbConnected = false;

        try {
            DB::connection()->getPdo();
            $dbConnected = true;
        } catch (\Exception) {
            //
        }

        return Inertia::render('installation/migrations', [
            'currentStep' => 5,
            'steps' => $this->steps,
            'dbConnected' => $dbConnected,
        ]);
    }

    public function runMigrations(Request $request): RedirectResponse
    {
        try {
            DB::connection()->getPdo();
        } catch (\Exception $e) {
            return back()->withErrors(['database' => 'No database connection: '.$e->getMessage()]);
        }

        Artisan::call('migrate', ['--force' => true]);
        Artisan::call('db:seed', ['--force' => true]);

        return redirect()->route('install.admin')->with('success', 'Migrations and seeders completed.');
    }

    public function admin(): Response|RedirectResponse
    {
        if ($this->isInstalled()) {
            return redirect('/');
        }

        return Inertia::render('installation/admin', [
            'currentStep' => 6,
            'steps' => $this->steps,
        ]);
    }

    public function createAdmin(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();
        $user->syncRoles(['HR Admin']);

        $envContent = File::get(base_path('.env'));

        if (str_contains($envContent, 'APP_INSTALLED')) {
            $envContent = preg_replace('/APP_INSTALLED=.*/', 'APP_INSTALLED=true', $envContent);
        } else {
            $envContent .= "\nAPP_INSTALLED=true";
        }

        File::put(base_path('.env'), $envContent);

        return redirect()->route('install.complete');
    }

    public function complete(): Response
    {
        return Inertia::render('installation/complete', [
            'currentStep' => 7,
            'steps' => $this->steps,
        ]);
    }
}
