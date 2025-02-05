from fpdf import FPDF
import os
from django.conf import settings

class PDF(FPDF):
    def header(self):
        self.set_font('Times', 'B', 15)
        self.cell(50)
        self.cell(100, 10, 'Condensed Notes on Video', 1, 0, 'C')
        self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, 'Page ' + str(self.page_no()) + '/{nb}', 0, 0, 'C')

def toPdf(class_notes, keywords, youtube_link):
    pdf = PDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.set_font('Times', '', 12)

    # Write Keywords Section
    pdf.set_font('Times', 'B', 12)
    pdf.cell(0, 10, "Keywords in this video:", ln=True)
    pdf.set_font('Times', '', 12)
    
    pdf.multi_cell(0, 8, ", ".join(keywords))
    pdf.ln(5)

    # Add class_notes line by line with spacing
    for note in class_notes:
        pdf.multi_cell(0, 8, note.strip())
        pdf.ln(5)

    # Ensure MEDIA_ROOT exists
    pdf_folder = os.path.join(settings.MEDIA_ROOT, "generated_pdfs")
    os.makedirs(pdf_folder, exist_ok=True)

    # Create a unique filename for the PDF
    pdf_filename = "video_notes.pdf"
    pdf_path = os.path.join(pdf_folder, pdf_filename)
    
    # Save the PDF
    pdf.output(pdf_path)

    return pdf_filename, pdf_path  # Return both filename and path
