@echo off
echo.
echo ========================================
echo   Imala PWA Icon Generator
echo ========================================
echo.
echo Opening icon generator in your browser...
echo.
start "" "%CD%\generate-png-icons.html"
echo.
echo Instructions:
echo 1. Click "Generate & Download Icons"
echo 2. Save icon-192.png and icon-512.png to public\icons\
echo 3. Run: npm run build
echo 4. Run: npm run preview
echo.
pause
