# Mountain100 開発環境セットアップスクリプト (Windows 11)
#
# 実行方法 (PowerShell を管理者として実行):
#   Set-ExecutionPolicy -Scope Process Bypass
#   .\scripts\setup-windows11.ps1
#
# インストールされるもの:
#   - Git for Windows
#   - Visual Studio Code
#   - Flutter SDK (C:\dev\flutter)
#   - iTunes (iPhone 接続用ドライバ)
#
# Sideloadly は winget にないため、https://sideloadly.io/ から手動で
# インストールしてください。

$ErrorActionPreference = 'Stop'
$flutterDir = 'C:\dev\flutter'

function Install-WingetPackage {
    param(
        [string]$Id,
        [string]$Name,
        [string]$Source = ''
    )
    Write-Host "==> $Name をインストールしています..." -ForegroundColor Cyan
    $args = @('install', '-e', '--id', $Id, '--accept-package-agreements', '--accept-source-agreements')
    if ($Source) { $args += @('--source', $Source) }
    & winget @args
    if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne -1978335189) {
        # -1978335189 = 既にインストール済み (APPINSTALLER_CLI_ERROR_PACKAGE_ALREADY_INSTALLED)
        Write-Warning "$Name のインストールに失敗しました (exit code: $LASTEXITCODE)"
    }
}

# winget の存在確認
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Error 'winget が見つかりません。Microsoft Store から「アプリ インストーラー」を入手してから再実行してください。'
    exit 1
}

Install-WingetPackage -Id 'Git.Git' -Name 'Git for Windows'
Install-WingetPackage -Id 'Microsoft.VisualStudioCode' -Name 'Visual Studio Code'
Install-WingetPackage -Id '9PB2MZ1ZMB1S' -Name 'iTunes' -Source 'msstore'

# Flutter SDK
if (Test-Path (Join-Path $flutterDir 'bin\flutter.bat')) {
    Write-Host "==> Flutter SDK は既に $flutterDir にあります。スキップします。" -ForegroundColor Cyan
} else {
    Write-Host "==> Flutter SDK を $flutterDir に取得しています..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path (Split-Path $flutterDir) | Out-Null
    # 直前に Git を入れた場合、このセッションの PATH に無いことがあるためフルパスで実行
    $git = "$env:ProgramFiles\Git\cmd\git.exe"
    if (-not (Test-Path $git)) { $git = 'git' }
    & $git clone https://github.com/flutter/flutter.git -b stable $flutterDir
}

# PATH へ Flutter を追加 (ユーザー環境変数)
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$flutterBin = Join-Path $flutterDir 'bin'
if ($userPath -notlike "*$flutterBin*") {
    Write-Host '==> PATH に Flutter を追加しています...' -ForegroundColor Cyan
    [Environment]::SetEnvironmentVariable('Path', "$userPath;$flutterBin", 'User')
}

Write-Host ''
Write-Host '========================================================' -ForegroundColor Green
Write-Host ' セットアップ完了。次の手順:' -ForegroundColor Green
Write-Host '  1. PowerShell を開き直して "flutter doctor" を実行'
Write-Host '  2. VS Code に Flutter 拡張機能を追加'
Write-Host '  3. https://sideloadly.io/ から Sideloadly をインストール'
Write-Host '  4. 詳細は docs/SETUP_WINDOWS11.md を参照'
Write-Host '========================================================' -ForegroundColor Green
