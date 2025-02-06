from django.db import models
from django.contrib.auth.models import User

class Concept(models.Model):
    """Stores different learning concepts"""
    name = models.CharField(max_length=255, unique=True)  # Ensures unique concept names

    def __str__(self):
        return self.name

class GeneratedNotes(models.Model):
    """Stores notes, PDFs, and categorizes into concepts"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Link to user
    youtube_link = models.URLField()  # Store original YouTube link
    pdf_file = models.FileField(upload_to='generated_pdfs/')  # Store PDF file
    class_notes = models.TextField(blank=True)  # Store summarized notes
    keywords = models.JSONField(default=list, blank=True)  # Store extracted keywords
    title = models.CharField(max_length=255, default="Summarized Notes")  # Title for notes
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp
    concept = models.ForeignKey(Concept, on_delete=models.SET_NULL, null=True, blank=True)  # Categorized into a concept

    def __str__(self):
        return f"{self.user.username} - {self.title} ({self.concept.name if self.concept else 'Uncategorized'})"
