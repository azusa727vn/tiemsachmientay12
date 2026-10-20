@echo off
start TiemsachServer.exe
timeout /t 2 /nobreak >nul
start http://localhost:3000/TiemSach-DangnhapDangky/TiemSachDangnhapDangky.html
pause