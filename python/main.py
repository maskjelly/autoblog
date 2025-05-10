from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import yt_dlp
import whisper
import tempfile
import os

app = FastAPI()
model = whisper.load_model("base")

class VideoLink(BaseModel):
    url: str

@app.post("/transcribe")
def transcribe_audio(data: VideoLink):
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            # Setup yt-dlp download config
            output_path = os.path.join(tmpdir, "audio.%(ext)s")
            ydl_opts = {
                "format": "bestaudio/best",
                "outtmpl": output_path,
                "quiet": True,
                "postprocessors": [{
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }],
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(data.url, download=True)
                downloaded_filename = ydl.prepare_filename(info).rsplit('.', 1)[0] + '.mp3'

            # Transcribe using Whisper
            result = model.transcribe(downloaded_filename)
            return {"transcription": result["text"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
