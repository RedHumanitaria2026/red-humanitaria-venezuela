@echo off
cd /d "C:\Users\PerGio\Documents\Claude\Projects\Red Humanitaria Venezuela"
echo === TypeScript Check === > build_output.txt 2>&1
call npx tsc --noEmit >> build_output.txt 2>&1
echo TSC_EXIT=%ERRORLEVEL% >> build_output.txt
echo === ESLint Check === >> build_output.txt 2>&1
call npx next lint >> build_output.txt 2>&1
echo LINT_EXIT=%ERRORLEVEL% >> build_output.txt
echo === Next Build === >> build_output.txt 2>&1
call npm run build >> build_output.txt 2>&1
echo BUILD_EXIT=%ERRORLEVEL% >> build_output.txt
