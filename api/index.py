from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import random

app = Flask(__name__)
CORS(app)

# Lista de Servidores Cobalt para Producción (Vercel)
# Lista de Servidores Cobalt para Producción (Vercel)
# Actualizada con instancias públicas estables
INSTANCES = [
    "https://cobalt.place",
    "https://api.cobalt.best",
    "https://cobalt.kwiatekmiki.pl",
    "https://api.wkr.one",
    "https://cobalt.154.53.53.53.sslip.io", 
    "https://dl.khub.ky",
    "https://cobalt.q13.me"
]

@app.route('/api/convert', methods=['POST'])
def convert():
    try:
        data = request.get_json()
        url = data.get('url')
        if not url: return jsonify({'error': 'Falta URL'}), 400

        random.shuffle(INSTANCES)
        
        for host in INSTANCES:
            try:
                # Pedimos MP3 a Cobalt (Formato moderno)
                # v7/v10 API usa downloadMode: "audio" o similar
                payload = {
                    "url": url, 
                    "downloadMode": "audio", 
                    "audioFormat": "mp3"
                }
                headers = {
                    "Accept": "application/json", 
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
                r = requests.post(f"{host}/api/json", json=payload, headers=headers, timeout=5)
                
                if r.status_code == 200:
                    d = r.json()
                    if d.get('url'):
                        return jsonify({
                            'success': True,
                            'title': 'MP3 Listo',
                            'downloadUrl': d.get('url'),
                            'format': 'MP3',
                            'isLocal': False
                        })
            except: continue

        return jsonify({'error': 'Servidores ocupados. Intenta en 1 min.'}), 503

    except Exception as e:
        return jsonify({'error': str(e)}), 500
