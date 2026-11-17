# Database configuration

The application reads its MySQL connection settings from environment variables:

- `DB_HOST` (defaults to `localhost`)
- `DB_USER` (defaults to `root`)
- `DB_PASSWORD` (defaults to an empty password)
- `DB_NAME` (defaults to `petcare`)
- `SESSION_SECRET` (required; use a long, unique random value)

Set `DB_PASSWORD` to the password for your local MySQL account before starting
the application. For example, in PowerShell:

```powershell
$env:DB_PASSWORD = "your-local-mysql-password"
$env:SESSION_SECRET = "your-long-random-session-secret"
node app.js
```
