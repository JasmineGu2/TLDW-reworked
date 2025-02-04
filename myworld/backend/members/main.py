import cohere
from dotenv import load_dotenv
import os
import pandas as pd

load_dotenv()

# Load API Key from .env file
co = cohere.Client(os.getenv('API_KEY_COHERE'))

# Import necessary functions
from .transcribe import *
from .script import *
from .classify import *
from .extract import *

def yt2var(link):
    """Processes a YouTube video: downloads, transcribes, summarizes, and classifies notes."""

    audio = CoolClass()
    filename, title = audio.download_file(link)

    def transcribe(filename):
        audio_url = upload(filename)
        transcript = save_transcript(audio_url, filename)
        os.remove(filename)
        return transcript

    # # 1️⃣ **Transcribe YouTube video to text**
    transcript = transcribe(filename)
    
    response = co.chat(
    message=f"Generate a summary of this text\n{transcript}"
).text
    
    summarized_array = [sentence.strip() for sentence in response.split("\n") if sentence.strip()]

    # ✅ **2️⃣ Classify the original text**
    predictions, texts = classifyNotes(summarized_array)  # Unpack classification results

    #✅ **3️⃣ Extract keywords from classified notes**
    keywords, filtered_array = keywordify(predictions, texts)  # Pass the correct variables
   
    # ✅ **4️⃣ Structure the final notes**
    sum_notes = [[predictions[i], texts[i]] for i in range(len(texts))]  # Pair classifications with texts
    join_note = [f"{note[0]}: {note[1]}" for note in sum_notes]  # Format for display
    title = "Summarized Notes"
    # class_notes = "\n".join(join_note)

    return join_note, keywords, title, sum_notes
