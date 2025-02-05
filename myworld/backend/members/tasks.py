from celery import shared_task
from celery_progress.backend import ProgressRecorder  # ✅ Import this
import time  # Simulating progress updates

@shared_task(bind=True)
def generate_pdf_task(self, link, user_id):
    progress_recorder = ProgressRecorder(self)  # ✅ Use ProgressRecorder

    # Simulated steps with progress updates
    progress_recorder.set_progress(10, 100, description="Downloading video...")
    time.sleep(2)

    progress_recorder.set_progress(40, 100, description="Transcribing video...")
    time.sleep(2)

    progress_recorder.set_progress(70, 100, description="Summarizing transcript...")
    time.sleep(2)

    progress_recorder.set_progress(90, 100, description="Generating PDF...")
    time.sleep(2)

    progress_recorder.set_progress(100, 100, description="Completed")

    return {"message": "PDF generated successfully"}
