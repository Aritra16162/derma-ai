from fpdf import FPDF
import datetime
import base64
import os
import uuid

class PDF(FPDF):
    def footer(self):
        self.set_y(-25)
        self.set_draw_color(226, 232, 240)
        self.line(15, self.get_y(), self.w - 15, self.get_y())
        self.set_y(-20)
        self.set_font("helvetica", "I", 8)
        self.set_text_color(148, 163, 184)
        text = "This report is generated automatically by an AI model and is intended for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment."
        self.multi_cell(0, 4, text, align="C")

def create_report_pdf(triage_data: dict, output_path: str):
    pdf = PDF(orientation='P', unit='mm', format='A4')
    pdf.add_page()
    pdf.set_margins(15, 15, 15)
    
    # Double Black Border (Page 1)
    pdf.set_draw_color(0, 0, 0)
    pdf.set_line_width(0.6)
    pdf.rect(5, 5, 200, 287)
    pdf.set_line_width(0.2)
    pdf.rect(6.5, 6.5, 197, 284)
    
    # ---------------- Header ----------------
    pdf.set_font("helvetica", "B", 24)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(pdf.get_string_width("Derma"), 10, "Derma", ln=0)
    pdf.set_text_color(37, 99, 235)
    pdf.cell(pdf.get_string_width("Guide "), 10, "Guide ", ln=0)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(pdf.get_string_width("AI"), 10, "AI", ln=0)
    
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(100, 116, 139)
    w = pdf.w - 30
    pdf.set_xy(15, 15)
    pdf.cell(w, 5, "AUTOMATED ANALYSIS REPORT", align="R", ln=2)
    
    report_id = triage_data.get('report_id', 'REF-UNKNOWN')
    pdf.set_font("courier", "", 9)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(w, 5, report_id, align="R", ln=1)
    
    pdf.set_y(28)
    pdf.set_draw_color(226, 232, 240)
    pdf.set_line_width(0.5)
    pdf.line(15, 28, pdf.w - 15, 28)
    
    pdf.ln(10)
    
    # ---------------- Patient Info Box ----------------
    pdf.set_fill_color(248, 250, 252)
    pdf.set_draw_color(241, 245, 249)
    pdf.rect(15, 33, w, 25, style="DF")
    
    patient_name = str(triage_data.get('patient_name', 'Guest Patient'))
    date_scan = str(triage_data.get('date', datetime.datetime.now().strftime("%B %d, %Y")))
    patient_id = str(triage_data.get('patient_id', 'N/A'))
    
    pdf.set_xy(20, 38)
    pdf.set_font("helvetica", "B", 9)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(30, 5, "Patient Name:")
    pdf.set_font("helvetica", "", 9)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(50, 5, patient_name)
    
    pdf.set_font("helvetica", "B", 9)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(30, 5, "Date of Scan:")
    pdf.set_font("helvetica", "", 9)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(40, 5, date_scan)
    
    pdf.set_xy(20, 48)
    pdf.set_font("helvetica", "B", 9)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(30, 5, "Patient ID:")
    pdf.set_font("courier", "", 9)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(50, 5, patient_id)
    
    pdf.set_y(65)
    
    # ---------------- Clinical Image ----------------
    image_data = triage_data.get('image_data')
    temp_img_path = None
    if image_data and "base64," in image_data:
        try:
            img_b64 = image_data.split("base64,")[1]
            img_bytes = base64.b64decode(img_b64)
            temp_img_path = f"temp_img_{uuid.uuid4().hex[:6]}.jpg"
            with open(temp_img_path, "wb") as f:
                f.write(img_bytes)
        except Exception as e:
            print("Error decoding image:", e)
            temp_img_path = None
            
    if temp_img_path and os.path.exists(temp_img_path):
        pdf.set_font("helvetica", "B", 14)
        pdf.set_text_color(30, 41, 59)
        pdf.set_fill_color(59, 130, 246)
        pdf.rect(15, pdf.get_y()+1, 1.5, 5, style="F")
        pdf.set_x(18)
        pdf.cell(0, 7, "Submitted Clinical Image", ln=1)
        
        pdf.set_font("helvetica", "", 10)
        pdf.set_text_color(100, 116, 139)
        pdf.multi_cell(0, 5, "The AI model has processed the uploaded dermoscopic/clinical image to identify areas of morphological concern.")
        pdf.ln(2)
        
        pdf.set_fill_color(248, 250, 252)
        pdf.set_draw_color(226, 232, 240)
        # Increase image size to fill page better
        pdf.rect(15, pdf.get_y(), 130, 95, style="DF")
        
        try:
            pdf.image(temp_img_path, x=17, y=pdf.get_y()+2, w=126, h=82)
            pdf.set_xy(15, pdf.get_y()+85)
            pdf.set_font("helvetica", "B", 7)
            pdf.set_text_color(148, 163, 184)
            pdf.cell(130, 5, "INPUT IMAGE", align="C", ln=1)
            pdf.ln(20) # Space after image
        except Exception as e:
            print("Error embedding image:", e)
            pdf.set_y(pdf.get_y()+95)
    else:
        pdf.ln(15)
        
    # ---------------- Survey Data ----------------
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(30, 41, 59)
    pdf.set_fill_color(59, 130, 246)
    pdf.rect(15, pdf.get_y()+1, 1.5, 5, style="F")
    pdf.set_x(18)
    pdf.cell(0, 7, "Reported Symptoms", ln=1)
    pdf.ln(2)
    
    pdf.set_draw_color(226, 232, 240)
    survey = triage_data.get('survey', {})
    
    duration = str(survey.get('duration', 'Not specified'))
    pain = str(survey.get('pain', 'Not specified'))
    spreading = str(survey.get('spreading', 'Not specified'))
    fever = str(survey.get('fever', 'Not specified'))
    history = str(survey.get('history', 'Not specified'))
    
    y = pdf.get_y()
    pdf.rect(15, y, w/2 - 2, 15)
    pdf.set_xy(17, y + 2)
    pdf.set_font("helvetica", "B", 7)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(0, 4, "DURATION", ln=1)
    pdf.set_x(17)
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 6, duration, ln=1)
    
    pdf.rect(15 + w/2 + 2, y, w/2 - 2, 15)
    pdf.set_xy(17 + w/2 + 2, y + 2)
    pdf.set_font("helvetica", "B", 7)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(0, 4, "PAIN/ITCHINESS", ln=1)
    pdf.set_x(17 + w/2 + 2)
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 6, pain, ln=1)
    
    y += 18
    pdf.rect(15, y, w/2 - 2, 15)
    pdf.set_xy(17, y + 2)
    pdf.set_font("helvetica", "B", 7)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(0, 4, "SPREADING", ln=1)
    pdf.set_x(17)
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 6, spreading, ln=1)
    
    pdf.rect(15 + w/2 + 2, y, w/2 - 2, 15)
    pdf.set_xy(17 + w/2 + 2, y + 2)
    pdf.set_font("helvetica", "B", 7)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(0, 4, "PRIOR OCCURRENCE", ln=1)
    pdf.set_x(17 + w/2 + 2)
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 6, history, ln=1)

    y += 18
    pdf.rect(15, y, w/2 - 2, 15)
    pdf.set_xy(17, y + 2)
    pdf.set_font("helvetica", "B", 7)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(0, 4, "FEVER", ln=1)
    pdf.set_x(17)
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 6, fever, ln=1)

    pdf.ln(15)

    # ---------------- Next Page ----------------
    pdf.add_page()
    
    # Double Black Border (Page 2)
    pdf.set_draw_color(0, 0, 0)
    pdf.set_line_width(0.6)
    pdf.rect(5, 5, 200, 287)
    pdf.set_line_width(0.2)
    pdf.rect(6.5, 6.5, 197, 284)

    # ---------------- Model Classification Results ----------------
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(30, 41, 59)
    pdf.set_fill_color(59, 130, 246)
    pdf.rect(15, pdf.get_y()+1, 1.5, 5, style="F")
    pdf.set_x(18)
    pdf.cell(0, 7, "Model Classification Results", ln=1)
    pdf.ln(8) # Space before table
    
    pdf.set_fill_color(30, 41, 59)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(w/2, 10, " Diagnostic Category", fill=True, ln=0)
    pdf.cell(w/2, 10, " Triage Recommendation", fill=True, ln=1)
    
    pdf.set_fill_color(248, 250, 252)
    pdf.set_text_color(15, 23, 42)
    pdf.set_font("helvetica", "B", 10)
    
    condition = str(triage_data.get('predicted_class', 'Unknown'))
    urgency = str(triage_data.get('danger_level', 'Routine'))
    
    pdf.cell(w/2, 12, f" {condition}", border="B", fill=True, ln=0)
    
    if urgency == "Seek Care Today":
        pdf.set_text_color(185, 28, 28)
    elif urgency == "See Doctor":
        pdf.set_text_color(161, 98, 7)
    else:
        pdf.set_text_color(21, 128, 61)
        
    pdf.cell(w/2, 12, f" {urgency}", border="B", fill=True, ln=1)
    pdf.ln(15) # Space after table
    
    # ---------------- Advanced AI Insights ----------------
    gea_summary = triage_data.get('gea_summary')
    gea_details = triage_data.get('gea_details')
    
    if gea_summary and gea_details:
        pdf.set_font("helvetica", "B", 14)
        pdf.set_text_color(30, 41, 59)
        pdf.set_fill_color(168, 85, 247)
        pdf.rect(15, pdf.get_y()+1, 1.5, 5, style="F")
        pdf.set_x(18)
        pdf.cell(0, 7, "Advanced AI Insights", ln=1)
        pdf.ln(6)
        
        pdf.set_font("helvetica", "B", 10)
        pdf.set_text_color(88, 28, 135)
        pdf.set_fill_color(243, 232, 255)
        summary_w = pdf.get_string_width(gea_summary) + 6
        pdf.cell(summary_w, 10, gea_summary, fill=True, border=1, align="C", ln=1)
        pdf.ln(3) # Minimal space before text, matching paragraph line height
        
        pdf.set_font("helvetica", "", 12) # Larger font
        pdf.set_text_color(51, 65, 85)
        formatted_details = gea_details.replace('\n', '\n\n')
        pdf.multi_cell(0, 7, formatted_details, markdown=True)
        pdf.ln(12)
        
    try:
        pdf.output(output_path)
    finally:
        if temp_img_path and os.path.exists(temp_img_path):
            os.remove(temp_img_path)
