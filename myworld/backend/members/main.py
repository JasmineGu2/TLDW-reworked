import cohere
from dotenv import load_dotenv
import os
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .transcribe import *
from .script import *
from .classify import *
from .extract import *
from .pdf import toPdf  # ✅ Import PDF function

load_dotenv()
co = cohere.Client('be9hsXdGngivV7mpMBN7toSumRn9mu11YX638ARk')

def yt2var(link, user_id):
    """Processes a YouTube video: downloads, transcribes, summarizes, classifies, and generates PDF."""

    channel_layer = get_channel_layer()
    task_group = f"user_{user_id}"

    def send_update(progress, status, pdf_url=None):
        """Send WebSocket update to frontend"""
        message = {"progress": progress, "status": status}
        if pdf_url:
            message["pdf_url"] = pdf_url  # ✅ Send PDF URL on completion
        async_to_sync(channel_layer.group_send)(task_group, {"type": "send_progress", **message})

    # ✅ Start Processing
    send_update(5, "Downloading audio...")
    audio = CoolClass()
    filename, title = audio.download_file(link)

    # ✅ **1️⃣ Transcribe Video**
    send_update(20, "Uploading and transcribing...")
    audio_url = upload(filename)
    transcript = save_transcript(audio_url, filename)
    os.remove(filename)

    # ✅ **2️⃣ Summarize Transcript**
    send_update(50, "Summarizing transcript...")
    response = co.chat(message=f"Generate a summary of this text\n{transcript}").text
    summarized_array = [sentence.strip() for sentence in response.split("\n") if sentence.strip()]

    # ✅ **3️⃣ Classify Summarized Text**
    send_update(70, "Classifying notes...")
    predictions, texts = classifyNotes(summarized_array)

    # ✅ **4️⃣ Extract Keywords**
    send_update(85, "Extracting keywords...")
    keywords, filtered_array = keywordify(predictions, texts)

    # ✅ **5️⃣ Structure Final Notes**
    send_update(95, "Finalizing notes...")
    sum_notes = [[predictions[i], texts[i]] for i in range(len(texts))]  # Pair classifications with texts
    join_note = [f"{note[0]}: {note[1]}" for note in sum_notes]  # Format for display
    title = "Summarized Notes"

    # ✅ **6️⃣ Generate PDF**
    send_update(98, "Generating PDF...")
    pdf_filename, pdf_path = toPdf(
        class_notes=join_note,
        keywords=keywords,
        youtube_link=link,
        user=user_id  # ✅ Pass user ID instead of object
    )

    pdf_url = f"/media/generated_pdfs/{pdf_filename}"  # ✅ Public path for frontend

    # ✅ Final WebSocket Update with PDF
    send_update(100, "Completed!", pdf_url=pdf_url)

    return {
        "class_notes": join_note,
        "keywords": keywords,
        "title": title,
        "pdf_url": pdf_url
    }
