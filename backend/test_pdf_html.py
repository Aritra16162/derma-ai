from fpdf import FPDF
import os

pdf = FPDF()
pdf.add_page()
pdf.set_font("helvetica", size=12)

html = 'This is a <mark>highlighted</mark> text.'
try:
    pdf.write_html(html)
    pdf.output("test.pdf")
    print("Success. File size:", os.path.getsize("test.pdf"))
except Exception as e:
    print("Error:", e)
