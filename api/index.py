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
# Lista de Servidores Cobalt para Producción (Vercel)
# Actualizada con instancias diversas para maximizar éxito.
INSTANCES = [
    "https://api.cobalt.tools",          # Oficial (Prioridad)
    "https://api.server.cobalt.tools",   # Oficial Alternativa
    "https://cobalt.mashedpotat.uno",    # Comunidad
    "https://dl.khub.ky",               # Comunidad
    "https://cobalt.xy24.eu.org",       # Comunidad
    "https://api.cobalt.best",          # Comunidad
    "https://cobalt.kwiatekmiki.pl",    # Comunidad
    "https://api.wkr.one",              # Comunidad
    "https://cobalt.q13.me",            # Comunidad
    "https://cobalt.154.53.53.53.sslip.io" # Raw IP
]

# ... (Cobalt Instances defined above) ...

# Lista de instancias Piped (Fallback robusto)
PIPED_INSTANCES = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.tokhmi.xyz",
    "https://piped-api.lunar.icu",
    "https://pipedapi.rivo.lol",
    "https://api.piped.privacydev.net",
    "https://pipedapi.leptons.xyz"
]

def try_piped_api(video_url):
    """Intenta obtener el stream de audio usando API de Piped"""
    try:
        # Extraer ID de video simple
        video_id = ""
        if "v=" in video_url:
            video_id = video_url.split("v=")[1].split("&")[0]
        elif "youtu.be/" in video_url:
            video_id = video_url.split("youtu.be/")[1].split("?")[0]
        
        if not video_id:
            return None

        # Probar instancias
        for host in PIPED_INSTANCES:
            try:
                print(f"Probando Piped: {host}")
                resp = requests.get(f"{host}/streams/{video_id}", timeout=6)
                if resp.status_code == 200:
                    data = resp.json()
                    # Buscar streams de audio
                    audio_streams = data.get('audioStreams', [])
                    if not audio_streams:
                        continue
                        
                    # Priorizar M4A de mejor calidad
                    # Piped suele devolver m4a como audio/mp4
                    best_audio = None
                    for stream in audio_streams:
                        if stream.get('mimeType') == 'audio/mp4' or stream.get('format') == 'M4A':
                            best_audio = stream
                            break # Encontramos uno bueno
                    
                    if not best_audio and len(audio_streams) > 0:
                        best_audio = audio_streams[0] # Fallback a lo que sea

                    if best_audio:
                        return {
                            "success": True,
                            "status": "stream",
                            "downloadUrl": best_audio['url'],
                            "title": data.get('title', 'Audio'),
                            "thumbnail": data.get('thumbnailUrl', ''),
                            "format": "M4A" # Piped es nativo M4A usualmente
                        }
            except Exception as e:
                print(f"Error en Piped {host}: {e}")
                continue
                
    except Exception as e:
        print(f"Error general Piped: {e}")
        return None

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

        # Ejecutar tests Cobalt en paralelo (max 5 hosts)
        results = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(check_instance, host) for host in config[:5]]
            for future in concurrent.futures.as_completed(futures):
                res = future.result()
                if res and res.get('success'):
                    return jsonify(res)
                if res: results.append(res)

        # Si Cobalt falla todos, intentar Piped (Fallback)
        print("Cobalt falló, intentando Piped...")
        piped_result = try_piped_api(url)
        if piped_result:
             return jsonify(piped_result)

        # Si todo falla
        return jsonify({
            'error': 'Servidores ocupados o bloqueados.',
            'debug': results 
        }), 503

    except Exception as e:
        return jsonify({'error': str(e)}), 500
