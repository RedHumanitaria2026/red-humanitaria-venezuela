@echo off
cd /d "C:\Users\PerGio\Documents\Claude\Projects\Red Humanitaria Venezuela"
if exist ".git\index.lock" del /f ".git\index.lock"
git add .gitignore
git commit -m "chore: update gitignore with temp scripts"
git push origin main
echo PUSH_EXIT=%ERRORLEVEL%
pause
