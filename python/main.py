from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp
import tempfile
import os
from google.generativeai import GenerativeModel, configure
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load API key
GOOGLE_API_KEY = os.getenv("GENAI_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("GENAI_API_KEY environment variable not set")

configure(api_key=GOOGLE_API_KEY)
model = GenerativeModel("gemini-1.5-flash-latest")

class VideoLink(BaseModel):
    url: str

@app.post("/generate_blog")
async def generate_blog(data: VideoLink):
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            # Configure yt-dlp
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

            # Download audio
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(data.url, download=True)
                audio_path = ydl.prepare_filename(info).rsplit(".", 1)[0] + ".mp3"

            # Check if file exists
            if not os.path.exists(audio_path):
                raise HTTPException(status_code=500, detail="Audio file not found after download")

            # Generate blog content
            with open(audio_path, "rb") as audio_file:
                response = await model.generate_content_async(
                    ["Generate a detailed blog post from this audio. Include markdown formatting.", 
                     {"mime_type": "audio/mp3", "data": audio_file.read()}]
                )

            return {"blog_content": response.text}

    except yt_dlp.utils.DownloadError as e:
        raise HTTPException(status_code=400, detail=f"Couldn't download video: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
