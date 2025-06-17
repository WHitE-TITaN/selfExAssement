@echo off
echo Building C++ Neural Network Project...

cd Neural-Network

if not exist build mkdir build
cd build

echo Running CMake...
cmake ..

if %ERRORLEVEL% NEQ 0 (
    echo CMake failed!
    pause
    exit /b 1
)

echo Building with Make...
cmake --build . --config Release

if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo Build successful! Executable created at Neural-Network\build\Release\Neural-Network.exe
cd ..\..

pause 