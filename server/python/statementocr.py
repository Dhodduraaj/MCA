
import fitz  # PyMuPDF
import pdfplumber
import os
import csv
import re
import pandas as pd
from tabulate import tabulate
from pdf2image import convert_from_bytes
import pytesseract
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
import sys
import io

# Path to your Tesseract OCR
pytesseract.pytesseract.tesseract_cmd = r'Tesseract-OCR\tesseract.exe'

# -----------------------------
# Helper functions
# -----------------------------
def clean_text(text):
    if text is None:
        return ""
    text = re.sub(r'[\n\r\t]+', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def is_row_empty(row):
    return all(cell is None or cell.strip() == '' for cell in row)

def intersect_areas(bbox1, bbox2):
    x0_1, y0_1, x1_1, y1_1 = bbox1
    x0_2, y0_2, x1_2, y1_2 = bbox2 
    return not (x1_1 < x0_2 or x0_1 > x1_2 or y1_1 < y0_2 or y0_1 > y1_2)

def is_scanned_image(image):
    text = pytesseract.image_to_string(image)
    return bool(text.strip())

def extract_tables_from_pdf(pdf_bytes, page_num, output_dir):
    print(f"[INFO] Extracting tables from page {page_num+1}...")
    table_dataframes = []
    table_areas = []

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        tables = pdf.pages[page_num].extract_tables()
        if tables:
            print(f"[INFO] Found {len(tables)} table(s) on page {page_num+1}")
            for table_index, table in enumerate(tables):
                if len(table) > 1 and not all(is_row_empty(row) for row in table):
                    # Save CSV for debugging
                    os.makedirs(output_dir, exist_ok=True)
                    table_path = os.path.join(output_dir, f"page_{page_num + 1}_table{table_index + 1}.csv")
                    with open(table_path, mode='w', newline='', encoding='utf-8') as csv_file:
                        writer = csv.writer(csv_file)
                        for row in table:
                            cleaned_row = [clean_text(cell) for cell in row]
                            writer.writerow(cleaned_row)
                    df = pd.read_csv(table_path)
                    df_str = tabulate(df, headers='keys', tablefmt='grid', showindex=False)
                    table_dataframes.append(df_str)
                    # Get table bbox if available
                    try:
                        table_bbox = pdf.pages[page_num].find_tables()[table_index].bbox
                        table_areas.append(table_bbox)
                    except:
                        pass
        else:
            print(f"[INFO] No tables detected on page {page_num+1}")

    return table_dataframes, table_areas

def extract_image_text_from_pdf_page(pdf_bytes, page_num):
    print(f"[INFO] Extracting OCR text from scanned page {page_num+1}...")
    images = convert_from_bytes(pdf_bytes, first_page=page_num+1, last_page=page_num+1)
    image_text = ""
    for image in images:
        if is_scanned_image(image):
            image_text = pytesseract.image_to_string(image)
    return image_text

def extract_contents_from_pdf_bytes(pdf_bytes, output_dir):
    print("[INFO] Starting PDF content extraction...")
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    total_pages = doc.page_count
    print(f"[INFO] PDF has {total_pages} page(s).")

    full_report = ""
    
    def process_page(page_num):
        page = doc.load_page(page_num)
        print(f"[INFO] Processing page {page_num+1}...")
        table_dataframes, table_areas = extract_tables_from_pdf(pdf_bytes, page_num, output_dir)
        extracted_text = page.get_text("blocks")
        text = ""

        for block in extracted_text:
            bbox = block[:4]
            block_text = block[4]
            if not any(intersect_areas(bbox, table_bbox) for table_bbox in table_areas):
                text += block_text

        if not text.strip():
            print(f"[WARN] No text detected on page {page_num+1}, running OCR...")
            text = extract_image_text_from_pdf_page(pdf_bytes, page_num)

        page_content = f"Page {page_num + 1}:\n{text}"
        if table_dataframes:
            page_content += "\n" + "\n".join(table_dataframes)
        else:
            page_content += "\nNo tables detected on this page."
        
        print(f"[INFO] Finished page {page_num+1}")
        return page_content

    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(process_page, page_num) for page_num in range(total_pages)]
        for future in futures:
            full_report += future.result() + "\n" + "="*40 + "\n"

    doc.close()
    return full_report

# -----------------------------
# Main execution
# -----------------------------
# -----------------------------
# Main execution
# -----------------------------
if __name__ == "__main__":
    print("[INFO] statementocr.py started")
    pdf_bytes = sys.stdin.buffer.read()

    if not pdf_bytes:
        print("[ERROR] No PDF bytes received from stdin")
        sys.exit(1)

    print("[INFO] PDF bytes received, extracting contents...")
    output_dir = r"ExtractedTables"
    os.makedirs(output_dir, exist_ok=True)

    extracted_text = extract_contents_from_pdf_bytes(pdf_bytes, output_dir)

    # Save extracted text to a .txt file
    output_txt_path = r"extracted_text.txt"
    with open(output_txt_path, "w", encoding="utf-8") as txt_file:
        txt_file.write(extracted_text)

    print(f"[INFO] Extracted text saved to {output_txt_path}")

