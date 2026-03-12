<?php

return [
    'backup' => [
        'path' => env('HRIS_BACKUP_PATH', 'backups'),
        'retention_days' => (int) env('HRIS_BACKUP_RETENTION_DAYS', 14),
        'schedule_time' => env('HRIS_BACKUP_SCHEDULE', '01:00'),
        'mysql_dump_binary' => env('HRIS_MYSQLDUMP_BINARY', 'mysqldump'),
    ],
];
