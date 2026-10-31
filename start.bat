@echo off
title Aiyra Cookies - Next.js App
set "NODE_DIR=C:\Users\tole\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.20.0-win-x64"
set "PATH=%NODE_DIR%;%PATH%"

echo ==========================================================
echo       AIYRA COOKIES - NEXT.JS MULTI-ROLE CATALOG
echo ==========================================================
echo * Mode Pembeli (Semua Orang) : http://localhost:3000
echo * Mode Admin (Kelola Katalog): http://localhost:3000/admin
echo * PIN Admin Default          : 123456
echo ==========================================================
echo Sedang menjalankan server Next.js...
call "%NODE_DIR%\npm.cmd" run dev
pause

