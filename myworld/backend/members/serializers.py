from rest_framework import serializers
from .models import Concept, GeneratedNotes

class ConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Concept
        fields = "__all__"

class GeneratedNotesSerializer(serializers.ModelSerializer):
    concept = ConceptSerializer()  # Serialize concept data

    class Meta:
        model = GeneratedNotes
        fields = "__all__"
