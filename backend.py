from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import yt_dlp as youtube_dl
import os
from mutagen.easyid3 import EasyID3
import zipfile
import shutil
import time
from PIL import Image
import requests
from bs4 import BeautifulSoup
import logging

app = Flask(__name__)
CORS(app)

DOWNLOAD_FOLDER = 'downloads'
TEMP_FOLDER = 'temp'
MAX_FILE_AGE = 2 * 3600  # 2 hours in seconds

if not os.path.exists(DOWNLOAD_FOLDER):
    os.makedirs(DOWNLOAD_FOLDER)
if not os.path.exists(TEMP_FOLDER):
    os.makedirs(TEMP_FOLDER)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def delete_old_files(folder, max_age):
    now = time.time()
    for filename in os.listdir(folder):
        filepath = os.path.join(folder, filename)
        if os.path.isfile(filepath) and now - os.path.getmtime(filepath) > max_age:
            os.remove(filepath)
            logger.info(f"Deleted old file: {filepath}")

def fetch_lyrics(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        lyrics_container = soup.find('div', {'data-lyrics-container': 'true'})
        if lyrics_container:
            return lyrics_container.get_text(strip=True, separator='\n')
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching lyrics: {e}")
    return None

def move_and_tag_file(filepath, artist, album, track, title, track_number, genre, year):
    try:
        audio = EasyID3(filepath)
        audio['title'] = track or title
        audio['artist'] = artist or 'Unknown Artist'
        audio['album'] = album or 'Unknown Album'
        if track_number:
            audio['tracknumber'] = track_number
        if genre:
            audio['genre'] = genre
        if year:
            audio['date'] = year
        audio.save()

        artist_dir = os.path.join(TEMP_FOLDER, artist or 'Unknown Artist')
        album_dir = os.path.join(artist_dir, album or 'Unknown Album')
        if not os.path.exists(album_dir):
            os.makedirs(album_dir)

        final_mp3_path = os.path.join(album_dir, f"{track}.mp3" if track else f"{title}.mp3")
        shutil.move(filepath, final_mp3_path)
        return final_mp3_path
    except Exception as e:
        logger.error(f"Error moving and tagging file: {e}")
        raise

@app.route('/download', methods=['POST'])
def download():
    delete_old_files(DOWNLOAD_FOLDER, MAX_FILE_AGE)

    link = request.json.get('link')
    artist = request.json.get('artist')
    album = request.json.get('album')
    track = request.json.get('track')
    genius_link = request.json.get('geniusLink')
    track_number = request.json.get('trackNumber')
    genre = request.json.get('genre')
    year = request.json.get('year')

    if not link:
        return jsonify({'error': 'No link provided'}), 400

    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': os.path.join(TEMP_FOLDER, 'download.%(ext)s'),
        'writethumbnail': True,
    }

    try:
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(link, download=True)
            title = info_dict.get('title', None)
            filename = os.path.basename(ydl.prepare_filename(info_dict).replace('.webm', '.mp3').replace('.m4a', '.mp3'))
            filepath = os.path.join(TEMP_FOLDER, filename)

        # Rename file to user-provided song name
        if track:
            new_filepath = os.path.join(TEMP_FOLDER, f"{track}.mp3")
            os.rename(filepath, new_filepath)
            filepath = new_filepath

        final_mp3_path = move_and_tag_file(filepath, artist, album, track, title, track_number, genre, year)

        thumbnail_path = final_mp3_path.rsplit('.', 1)[0] + '.webp'
        jpg_thumbnail_path = None
        if os.path.exists(thumbnail_path):
            img = Image.open(thumbnail_path).convert('RGB')
            jpg_thumbnail_path = thumbnail_path.rsplit('.', 1)[0] + '.jpg'
            img.save(jpg_thumbnail_path, 'JPEG')
            os.remove(thumbnail_path)

        artist_dir = os.path.join(TEMP_FOLDER, artist or 'Unknown Artist')
        album_dir = os.path.join(artist_dir, album or 'Unknown Album')
        if jpg_thumbnail_path:
            final_thumbnail_path = os.path.join(album_dir, os.path.basename(jpg_thumbnail_path))
            shutil.move(jpg_thumbnail_path, final_thumbnail_path)

        # Move .webp thumbnail to album directory
        webp_thumbnail_path = os.path.join(TEMP_FOLDER, 'download.webp')
        if os.path.exists(webp_thumbnail_path):
            final_webp_thumbnail_path = os.path.join(album_dir, f"{track}.webp" if track else f"{title}.webp")
            shutil.move(webp_thumbnail_path, final_webp_thumbnail_path)

        if genius_link:
            lyrics = fetch_lyrics(genius_link)
            if lyrics:
                lyrics_filename = f"{track}.txt" if track else f"{title}.txt"
                lyrics_filepath = os.path.join(album_dir, lyrics_filename)
                with open(lyrics_filepath, 'w', encoding='utf-8') as f:
                    f.write(lyrics)

        zip_filename = f"{artist or 'Unknown Artist'}_{album or 'Unknown Album'}_{track or title}.zip"
        zip_filepath = os.path.join(DOWNLOAD_FOLDER, zip_filename)
        with zipfile.ZipFile(zip_filepath, 'w') as zipf:
            for root, _, files in os.walk(TEMP_FOLDER):
                for file in files:
                    zipf.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), TEMP_FOLDER))

        shutil.rmtree(TEMP_FOLDER)
        os.makedirs(TEMP_FOLDER)

        return jsonify({'title': title, 'filename': zip_filename}), 200
    except Exception as e:
        logger.error(f"Error processing download: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/downloaded/<filename>', methods=['GET'])
def get_file(filename):
    filepath = os.path.join(DOWNLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    return send_file(filepath, as_attachment=True)

# Run with port 50616
if __name__ == '__main__':
    app.run(debug=True, port=50616)
