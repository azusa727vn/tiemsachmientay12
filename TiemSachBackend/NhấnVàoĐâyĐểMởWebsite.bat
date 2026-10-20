@echo off
chcp 65001 > nul
echo  ...ĐANG KHỞI ĐỘNG HỆ THỐNG TIỆM SÁCH MIỀN TÂY...

start cmd /k "node server.js"
timeout /t 2 /nobreak > nul

start ../TiemSach-DangnhapDangky/TiemSachDangnhapDangky.html

echo.
echo [THÔNG BÁO] Server đã chạy và trình duyệt đã được mở!
pause