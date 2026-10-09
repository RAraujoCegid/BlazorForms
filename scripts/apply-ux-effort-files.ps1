$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent

$pairs = @(
  "prisma\schema.prisma",
  "src\types\index.ts",
  "src\lib\constants.ts",
  "src\app\api\forms\route.ts",
  "src\app\api\forms\[id]\route.ts",
  "src\components\card-detail\card-detail.tsx",
  "src\components\board\form-card.tsx"
)

foreach ($rel in $pairs) {
  $target = Join-Path $root $rel
  $staged = "$target.staged"
  if (-not (Test-Path $staged)) {
    Write-Warning "Staged file not found, skipping: $staged"
    continue
  }
  Copy-Item $target "$target.bak-pre-ux-effort" -Force
  Move-Item $staged $target -Force
  Write-Output "Applied: $rel"
}

Write-Output "`nAll files applied. Now rebuilding and restarting..."
Push-Location $root
npm run build
pm2 restart blazor-tracker
Pop-Location
