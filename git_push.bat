@echo off
cd /d "C:\Users\PerGio\Documents\Claude\Projects\Red Humanitaria Venezuela"
if exist ".git\index.lock" del /f ".git\index.lock"
git add -A
git commit -m "feat: redesign visual institucional"
git push origin main
echo PUSH_EXIT=%ERRORLEVEL%
pause
