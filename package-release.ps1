# 生成可售源码包：复制源码 -> 剔除个人数据与构建产物 -> 压缩为 zip
# 用法：powershell -ExecutionPolicy Bypass -File .\package-release.ps1

$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$stamp = Get-Date -Format "yyyyMMdd"
$name = "person-live-src-$stamp"
$releaseDir = Join-Path $root "release"
$dest = Join-Path $releaseDir $name

if (Test-Path $dest) { Remove-Item -LiteralPath $dest -Recurse -Force }
New-Item -ItemType Directory -Force -Path $dest | Out-Null

# 整体跳过的目录：版本库、IDE 配置、依赖、构建产物、发布目录本身
$excludeDirs = @(
    (Join-Path $root ".git"),
    (Join-Path $root ".idea"),
    (Join-Path $root "web\node_modules"),
    (Join-Path $root "web\dist"),
    (Join-Path $root "api\bin"),
    $releaseDir
)

# 跳过的文件：本地真实数据快照、编译产物、日志、内部说明
$excludeFiles = @(
    "003_finance_data.sql",
    "AGENTS.md",
    "*.log",
    "*.exe",
    "*.exe~"
)

$roboArgs = @($root, $dest, "/E", "/NFL", "/NDL", "/NJH", "/NJS", "/NP", "/R:1", "/W:1")
$roboArgs += "/XD"
$roboArgs += $excludeDirs
$roboArgs += "/XF"
$roboArgs += $excludeFiles

& robocopy @roboArgs | Out-Null
# robocopy 退出码 0-7 都表示成功，>=8 才是真的失败
if ($LASTEXITCODE -ge 8) { throw "robocopy 复制失败，退出码 $($LASTEXITCODE)" }

# 相册目录清空，只留占位文件，避免把个人照片一起卖出去
$albumDir = Join-Path $dest "api\storage\album"
if (Test-Path $albumDir) { Remove-Item -LiteralPath $albumDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $albumDir | Out-Null
New-Item -ItemType File -Force -Path (Join-Path $albumDir ".gitkeep") | Out-Null

$zipPath = Join-Path $releaseDir "$name.zip"
if (Test-Path $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
Compress-Archive -Path $dest -DestinationPath $zipPath -CompressionLevel Optimal

$sizeMB = [Math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host ""
Write-Host "已生成: $zipPath ($sizeMB MB)"
Write-Host "解压后目录: $dest"
