from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import random

app = Flask(__name__)
CORS(app)

# Lista de Servidores Cobalt para Producción (Vercel)
# Lista de Servidores Cobalt para Producción (Vercel)
# Actualizada con instancias diversas (IPs y Dominios) para evitar bloqueos
# Lista de Servidores Cobalt para Producción (Vercel)
# Actualizada con instancias diversas (IPs y Dominios) para evitar bloqueos
INSTANCES = [
    "https://api.cobalt.tools", 
    "https://cobalt.place",
    "https://api.cobalt.best",
    "https://cobalt.kwiatekmiki.pl",
    "https://api.wkr.one",
    "https://cobalt.154.53.53.53.sslip.io", 
    "https://dl.khub.ky",
    "https://cobalt.q13.me",
    "https://cobalt.xy24.eu.org",
    "https://api.cobalt.biz.id",
    "https://cobalt.mashedpotat.uno" 
]

@app.route('/api/convert', methods=['POST'])
def convert():
    try:
        data = request.get_json()
        url = data.get('url')
        if not url: return jsonify({'error': 'Falta URL'}), 400

        # Mezcla para evitar saturar siempre los mismos
        config = INSTANCES.copy()
        random.shuffle(config)
        
        # Limite Vercel 10s -> Usamos hilos para probar 3 en paralelo
        # y retornar el primero que sirva
        import concurrent.futures

        def check_instance(host):
            try:
                # 1. Intentar Payload Nuevo (v7/v10)
                payload_v7 = {
                    "url": url, 
                    "downloadMode": "audio", 
                    "audioFormat": "mp3",
                    "filenamePattern": "basic"
                }
                headers = {
                    "Accept": "application/json", 
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Origin": "https://donmusica.online",
                    "Referer": "https://donmusica.online/"
                }
                
                # Timeout corto para no bloquear
                r = requests.post(f"{host}/api/json", json=payload_v7, headers=headers, timeout=4)
                
                # Si falla con 400/422, intentar payload viejo
                if r.status_code in [400, 422]:
                    payload_legacy = {"url": url, "vt": "mp3"}
                    r = requests.post(f"{host}/api/json", json=payload_legacy, headers=headers, timeout=4)

                if r.status_code == 200:
                    d = r.json()
                    if d.get('url'):
                        return {
                            'success': True,
                            'title': 'MP3 Listo',
                            'downloadUrl': d.get('url'),
                            'format': 'MP3',
                            'host': host
                        }
            except Exception as e:
                return {'error': str(e), 'host': host}
            return None

        # Ejecutar en paralelo (max 5 hosts a la vez)
        results = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            # Tomamos los primeros 5 hosts aleatorios
            futures = [executor.submit(check_instance, host) for host in config[:5]]
            
            for future in concurrent.futures.as_completed(futures):
                res = future.result()
                if res and res.get('success'):
                    return jsonify(res)
                if res: results.append(res) # Guardar error para debug

        # Si llegamos aquí, todos fallaron
        return jsonify({
            'error': 'Servidores ocupados o bloqueados.',
            'debug': results # Para ver qué pasó en la consola
        }), 503

    except Exception as e:
        return jsonify({'error': str(e)}), 500
