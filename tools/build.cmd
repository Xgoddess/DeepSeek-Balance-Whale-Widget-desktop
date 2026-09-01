@echo off
cd /d D:\Wideget\src-tauri
cargo build > D:\Wideget\logs\build.log 2>&1
echo EXITCODE=%ERRORLEVEL% >> D:\Wideget\logs\build.log
