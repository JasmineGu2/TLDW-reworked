from django.db import models
from django.contrib.auth.models import User

class GeneratedPDF(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Link to user
    youtube_link = models.URLField()  # Store the original YouTube link
    pdf_file = models.FileField(upload_to='generated_pdfs/')  # Store the PDF file
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp

    def __str__(self):
        return f"{self.user.username} - {self.pdf_file.name}"
