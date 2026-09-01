@echo off
winget install --id Microsoft.VisualStudio.2022.BuildTools --exact --override "--wait --quiet --norestart --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended" --accept-source-agreements --accept-package-agreements > D:\Wideget\logs\msvc.log 2>&1
echo EXITCODE=%ERRORLEVEL% >> D:\Wideget\logs\msvc.log
