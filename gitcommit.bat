@echo off
set /p commit_message="Enter your commit message: "
git add .
git commit -m "%commit_message%"
git push origin master