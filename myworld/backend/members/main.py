import cohere
from django.conf import settings
from dotenv import load_dotenv
import os
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Concept, GeneratedNotes  # ✅ Updated to use GeneratedNotes
from .transcribe import *
from .script import *
from .classify import *
from .extract import *
from .pdf import toPdf  # ✅ Import PDF function
from django.core.cache import cache
from django.core.files.base import ContentFile  # ✅ Needed for file upload

load_dotenv()
co = cohere.Client('be9hsXdGngivV7mpMBN7toSumRn9mu11YX638ARk')


import cohere
from django.conf import settings
from dotenv import load_dotenv
import os
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import GeneratedNotes  # Updated to use GeneratedNotes model
from .transcribe import *
from .script import *
from .classify import *
from .extract import *
from .pdf import toPdf  # Import PDF function
from django.core.cache import cache
from django.core.files.base import ContentFile  # Needed for file upload

load_dotenv()
co = cohere.Client('be9hsXdGngivV7mpMBN7toSumRn9mu11YX638ARk')


def yt2var(link, task_id, file_name, user, concept_name):
    """Processes a YouTube video and sends WebSocket progress updates"""

    channel_layer = get_channel_layer()
    task_group = f"progress_{task_id}"

    def send_update(progress, status, pdf_url=None):
        """Send WebSocket update to frontend"""
        message = {"progress": progress, "status": status}
        if pdf_url:
            message["pdf_url"] = pdf_url  # Include PDF URL when available

        async_to_sync(channel_layer.group_send)(
            task_group,
            {"type": "send_progress", **message}
        )

    # Check if the file name already exists for this user
    if GeneratedNotes.objects.filter(user=user, pdf_file=f"generated_pdfs/{file_name}.pdf").exists():
        send_update(0, "Error: File name already exists!")
        return {"error": "A PDF with this file name already exists. Please choose a different name."}

    # Step 1: Download audio from the given YouTube link
    send_update(5, "Downloading audio...")
    audio = CoolClass()
    filename, title = audio.download_file(link)

    # Step 2: Transcribe the audio
    send_update(20, "Uploading and transcribing...")
    audio_url = upload(filename)
    transcript = save_transcript(audio_url, filename)
    os.remove(filename)  # Remove temporary audio file

    # Step 3: Summarize the transcript
    send_update(50, "Summarizing transcript...")
    response = co.chat(message=f"Generate a summary of this text\n{transcript}").text
    summarized_array = [sentence.strip() for sentence in response.split("\n") if sentence.strip()]

    # Step 4: Classify the summarized text
    send_update(70, "Classifying notes...")
    predictions, texts = classify_notes(summarized_array)

    # Step 5: Extract important keywords
    # send_update(85, "Extracting keywords...")
    # keywords, filtered_array = keywordify(predictions, texts)
    keywords = extract(texts)
    keywords = "Keywords: " + keywords;

    # Step 6: Structure final notes
    send_update(95, "Finalizing notes...")
    sum_notes = [[predictions[i], texts[i]] for i in range(len(texts))]
    formatted_notes = [f"{note[0]}:\n{note[1]}\n \n" for note in sum_notes]  # Add extra line breaks
    formatted_notes = [str(note) for note in formatted_notes]  # Ensure all elements are strings
    formatted_text = "\n".join(formatted_notes)  # Join them properly
    # Step 7: Generate PDF with the summarized notes and keywords
    send_update(98, "Generating PDF...")
    pdf_filename, pdf_content = toPdf(
        class_notes=formatted_text,
        keywords=keywords,
        youtube_link=link,
        file_name=file_name
    )

    pdf_url = f"{settings.MEDIA_URL}generated_pdfs/{pdf_filename}"

    concept, _ = Concept.objects.get_or_create(name=concept_name)
    # Save all extracted data inside the `GeneratedNotes` model
    notes_instance = GeneratedNotes(
        user=user,
        youtube_link=link,
        title=file_name,
        concept=concept,
        class_notes= formatted_text,  # Store as a text block
        keywords=keywords,  # Store keywords as JSON
        pdf_file=f"generated_pdfs/{pdf_filename}"  # Store PDF file reference
    )

    notes_instance.pdf_file.save(pdf_filename, ContentFile(pdf_content))
    notes_instance.save()
    
    # Cache the result for quick access
    result_data = {
        "class_notes":formatted_text,
        "keywords": keywords,
        "title": file_name,
        "pdf_url": pdf_url
    }
    cache.set(task_id, result_data, timeout=3600)

    # Send final WebSocket update with the completed PDF link
    send_update(100, "Completed!", pdf_url=pdf_url)

    return result_data
