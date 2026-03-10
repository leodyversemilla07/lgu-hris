<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>403 – Forbidden</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; background: #f8fafc; color: #1e293b;
    display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
  .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 48px;
    max-width: 480px; width: 100%; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
  .code { font-size: 72px; font-weight: 800; color: #1e3a5f; line-height: 1; }
  .title { font-size: 22px; font-weight: 600; margin-top: 16px; }
  .message { color: #64748b; font-size: 15px; margin-top: 8px; line-height: 1.6; }
  .back { display: inline-block; margin-top: 32px; padding: 10px 24px; background: #1e3a5f;
    color: white; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; }
  .back:hover { background: #1a3350; }
</style>
</head>
<body>
  <div class="card">
    <div class="code">403</div>
    <div class="title">Access Denied</div>
    <div class="message">
      You do not have permission to view this page.<br>
      Contact your HR Administrator if you believe this is an error.
    </div>
    <a href="/dashboard" class="back">Go to Dashboard</a>
  </div>
</body>
</html>
