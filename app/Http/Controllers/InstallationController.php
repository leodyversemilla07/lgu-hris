<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class InstallationController extends Controller
{
    public function index()
    {
        // Check if already installed
        if ($this->isInstalled()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('installation/index', [
            'steps' => $this->getSteps(),
            'currentStep' => 1,
        ]);
    }

    public function checkRequirements()
    {
        $requirements = [
            'php_version' => [
                'current' => PHP_VERSION,
                'required' => '8.2.0',
                'pass' => version_compare(PHP_VERSION, '8.2.0', '>='),
            ],
            'extensions' => [
                'openssl' => extension_loaded('openssl'),
                'pdo' => extension_loaded('pdo'),
                'mbstring' => extension_loaded('mbstring'),
                'tokenizer' => extension_loaded('tokenizer'),
                'xml' => extension_loaded('xml'),
                'ctype' => extension_loaded('ctype'),
                'json' => extension_loaded('json'),
                'gd' => extension_loaded('gd'),
            ],
            'writable' => [
                'storage' => is_writable(storage_path()),
                'bootstrap/cache' => is_writable(base_path('bootstrap/cache')),
                'config' => is_writable(config_path()),
            ],
        ];

        return Inertia::render('installation/requirements', [
            'requirements' => $requirements,
            'passed' => $this->checkRequirementsPass($requirements),
        ]);
    }

    public function database(): Response
    {
        return Inertia::render('installation/database');
    }

    public function environment(): Response
    {
        return Inertia::render('installation/environment');
    }

    public function migrations(): Response
    {
        return Inertia::render('installation/migrations');
    }

    public function admin(): Response
    {
        return Inertia::render('installation/admin');
    }

    public function storeDatabase(Request $request)
    {
        $data = $request->validate([
            'host' => 'required|string',
            'port' => 'nullable|integer',
            'database' => 'required|string',
            'username' => 'required|string',
            'password' => 'nullable|string',
        ]);

        $request->session()->put('install.database', [
            'host' => $data['host'],
            'port' => $data['port'] ?? 3306,
            'database' => $data['database'],
            'username' => $data['username'],
            'password' => $data['password'] ?? '',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Database configuration saved',
        ]);
    }

    public function checkDatabase(Request $request)
    {
        $data = $request->validate([
            'host' => 'required|string',
            'port' => 'nullable|integer',
            'database' => 'required|string',
            'username' => 'required|string',
            'password' => 'nullable|string',
        ]);

        $serverConfig = [
            'driver' => 'mysql',
            'host' => $data['host'],
            'port' => $data['port'] ?? 3306,
            'database' => null,
            'username' => $data['username'],
            'password' => $data['password'],
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'engine' => null,
        ];

        try {
            // Test server connection first so we can report missing databases clearly.
            config(['database.connections.install' => $serverConfig]);
            DB::purge('install');

            $connection = DB::connection('install');
            $connection->getPdo();

            // Test database existence using INFORMATION_SCHEMA for compatibility.
            $dbName = $data['database'];
            $result = $connection->select(
                'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
                [$dbName]
            );

            return response()->json([
                'success' => true,
                'message' => 'Database connection successful',
                'database_exists' => ! empty($result),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function storeEnvironment(Request $request)
    {
        $envData = $request->validate([
            'app_url' => 'required|url',
            'app_name' => 'required|string|max:255',
            'mail_driver' => 'required|string',
            'mail_host' => 'nullable|string',
            'mail_port' => 'nullable|integer',
            'mail_username' => 'nullable|string',
            'mail_password' => 'nullable|string',
            'mail_encryption' => 'nullable|string',
            'mail_from_address' => 'nullable|string|email',
            'mail_from_name' => 'nullable|string',
        ]);

        $databaseData = $request->session()->get('install.database');

        if (! is_array($databaseData)) {
            return response()->json([
                'success' => false,
                'message' => 'Database configuration is missing. Please complete the database step first.',
            ], 422);
        }

        $data = [
            ...$envData,
            'database_host' => $databaseData['host'],
            'database_port' => $databaseData['port'],
            'database_name' => $databaseData['database'],
            'database_username' => $databaseData['username'],
            'database_password' => $databaseData['password'],
        ];

        try {
            // Generate app key
            $key = 'base64:'.base64_encode(random_bytes(32));

            // Build .env content
            $envContent = $this->buildEnvContent($data, $key);

            // Write .env file
            File::put(base_path('.env'), $envContent);

            // Clear config cache
            Artisan::call('config:clear');

            return response()->json([
                'success' => true,
                'message' => 'Environment file created successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function runMigrations()
    {
        try {
            $databaseData = request()->session()->get('install.database');

            if (is_array($databaseData)) {
                $databaseName = str_replace('`', '``', (string) $databaseData['database']);

                $serverConfig = [
                    'driver' => 'mysql',
                    'host' => $databaseData['host'],
                    'port' => $databaseData['port'] ?? 3306,
                    'database' => null,
                    'username' => $databaseData['username'],
                    'password' => $databaseData['password'],
                    'charset' => 'utf8mb4',
                    'collation' => 'utf8mb4_unicode_ci',
                    'prefix' => '',
                    'strict' => true,
                    'engine' => null,
                ];

                config(['database.connections.install_server' => $serverConfig]);
                DB::purge('install_server');
                DB::connection('install_server')->statement(
                    "CREATE DATABASE IF NOT EXISTS `{$databaseName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
                );
            }

            // Run migrations
            Artisan::call('migrate --force');

            // Seed basic data
            Artisan::call('db:seed --class=DatabaseSeeder --force');

            return response()->json([
                'success' => true,
                'message' => 'Database migrations completed successfully',
                'output' => Artisan::output(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function createAdmin(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            // Create admin user
            Artisan::call('hris:create-admin', [
                '--name' => $data['name'],
                '--email' => $data['email'],
                '--password' => $data['password'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Admin user created successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function complete(): Response
    {
        // Mark as installed
        File::put(storage_path('framework/install.lock'), now()->toIso8601String());

        request()->session()->forget('install.database');

        return Inertia::render('installation/complete');
    }

    private function isInstalled(): bool
    {
        return File::exists(storage_path('framework/install.lock'))
            && File::exists(base_path('.env'));
    }

    private function getSteps(): array
    {
        return [
            [
                'id' => 1,
                'title' => 'Requirements',
                'description' => 'Check server requirements',
                'icon' => 'check-circle',
            ],
            [
                'id' => 2,
                'title' => 'Database',
                'description' => 'Configure database connection',
                'icon' => 'database',
            ],
            [
                'id' => 3,
                'title' => 'Environment',
                'description' => 'Setup application settings',
                'icon' => 'settings',
            ],
            [
                'id' => 4,
                'title' => 'Database Setup',
                'description' => 'Run migrations and seeders',
                'icon' => 'refresh-cw',
            ],
            [
                'id' => 5,
                'title' => 'Admin User',
                'description' => 'Create administrator account',
                'icon' => 'user-plus',
            ],
            [
                'id' => 6,
                'title' => 'Complete',
                'description' => 'Installation finished',
                'icon' => 'check',
            ],
        ];
    }

    private function checkRequirementsPass(array $requirements): bool
    {
        if (! $requirements['php_version']['pass']) {
            return false;
        }

        foreach ($requirements['extensions'] as $ext => $loaded) {
            if (! $loaded) {
                return false;
            }
        }

        foreach ($requirements['writable'] as $path => $writable) {
            if (! $writable) {
                return false;
            }
        }

        return true;
    }

    private function buildEnvContent(array $data, string $key): string
    {
        $mailHost = $data['mail_host'] ?? '';
        $mailPort = $data['mail_port'] ?? 587;
        $mailUsername = $data['mail_username'] ?? '';
        $mailPassword = $data['mail_password'] ?? '';
        $mailEncryption = $data['mail_encryption'] ?? 'tls';
        $mailFromAddress = $data['mail_from_address'] ?? '';
        $mailFromName = $data['mail_from_name'] ?? '';

        return "APP_NAME=\"{$data['app_name']}\"\n".
               "APP_ENV=production\n".
               "APP_KEY={$key}\n".
               "APP_DEBUG=false\n".
               "APP_URL={$data['app_url']}\n".
               "\n".
               "LOG_CHANNEL=stack\n".
               "LOG_DEPRECATIONS_CHANNEL=null\n".
               "LOG_LEVEL=debug\n".
               "\n".
               "DB_CONNECTION=mysql\n".
               "DB_HOST={$data['database_host']}\n".
               "DB_PORT={$data['database_port']}\n".
               "DB_DATABASE={$data['database_name']}\n".
               "DB_USERNAME={$data['database_username']}\n".
               "DB_PASSWORD={$data['database_password']}\n".
               "\n".
               "BROADCAST_DRIVER=log\n".
               "CACHE_DRIVER=file\n".
               "FILESYSTEM_DISK=local\n".
               "QUEUE_CONNECTION=sync\n".
               "SESSION_DRIVER=file\n".
               "SESSION_LIFETIME=120\n".
               "\n".
               "MEMCACHED_HOST=127.0.0.1\n".
               "\n".
               "REDIS_HOST=127.0.0.1\n".
               "REDIS_PASSWORD=null\n".
               "REDIS_PORT=6379\n".
               "\n".
               "MAIL_MAILER={$data['mail_driver']}\n".
               "MAIL_HOST={$mailHost}\n".
               "MAIL_PORT={$mailPort}\n".
               "MAIL_USERNAME={$mailUsername}\n".
               "MAIL_PASSWORD={$mailPassword}\n".
               "MAIL_ENCRYPTION={$mailEncryption}\n".
               "MAIL_FROM_ADDRESS={$mailFromAddress}\n".
               "MAIL_FROM_NAME=\"{$mailFromName}\"\n".
               "\n".
               "AWS_ACCESS_KEY_ID=\n".
               "AWS_SECRET_ACCESS_KEY=\n".
               "AWS_DEFAULT_REGION=us-east-1\n".
               "AWS_BUCKET=\n".
               "AWS_USE_PATH_STYLE_ENDPOINT=false\n".
               "\n".
               "PUSHER_APP_ID=\n".
               "PUSHER_APP_KEY=\n".
               "PUSHER_APP_SECRET=\n".
               "PUSHER_HOST=\n".
               "PUSHER_PORT=443\n".
               "PUSHER_SCHEME=https\n".
               "PUSHER_APP_CLUSTER=mt1\n".
               "\n".
               "VITE_PUSHER_APP_KEY=\"\"\n".
               "VITE_PUSHER_HOST=\"\"\n".
               "VITE_PUSHER_PORT=\"\"\n".
               "VITE_PUSHER_SCHEME=\"\"\n".
               "VITE_PUSHER_APP_CLUSTER=\"\"\n";
    }
}
