@echo off
cd /d D:\Wideget\src-tauri
cargo build --release > D:\Wideget\logs\release.log 2>&1
echo EXITCODE=%ERRORLEVEL% >> D:\Wideget\logs\release.log
