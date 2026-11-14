@echo off
title Push to GitHub - Aiyra Cookies
set "GIT_DIR=C:\Users\tole\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd"
set "PATH=%GIT_DIR%;%PATH%"

echo ==========================================================
echo        PUSH AIYRA COOKIES KE GITHUB REPOSITORY
echo ==========================================================
echo Target : https://github.com/ahmadanwars/aiyra-cookies.git
echo Branch : main
echo.
echo Sedang melakukan git push...
git push origin main
echo.
if %errorlevel% equ 0 (
    echo [BERHASIL] Kodingan telah berhasil di-push ke GitHub!
) else (
    echo ----------------------------------------------------------
    echo [PETUNJUK AUTENTIKASI GITHUB]
    echo Jika muncul permintaan login, Anda bisa:
    echo 1. Menggunakan GitHub Personal Access Token (PAT) sebagai password.
    echo 2. Atau ketik di terminal: gh auth login
    echo ----------------------------------------------------------
)
echo ==========================================================
pause

