@echo off
echo Instalando dependencias necesarias...
pip install -r api/requirements.txt
echo.
echo Iniciando servidor backend local...
python api/server.py
pause
