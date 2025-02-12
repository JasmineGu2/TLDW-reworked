from django.contrib import admin
from .models import Concept

@admin.register(Concept)
class ConceptAdmin(admin.ModelAdmin):
    list_display = ("id", "name")  # Show ID & Name in admin panel
    search_fields = ("name",)  # Enable search by name
    list_editable = ("name",)  # ✅ Allows direct editing of the 'name' field
