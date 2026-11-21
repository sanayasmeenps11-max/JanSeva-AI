"""Optional OCR adapter. Requires local Tesseract and pytesseract for image OCR."""
def extract_text(path, extension):
    if extension == "pdf":
        return "PDF saved. Automatic PDF OCR is not configured; review the original document manually."
    try:
        from PIL import Image
        import pytesseract
        return pytesseract.image_to_string(Image.open(path)).strip() or "No readable text detected. Please check the original document."
    except ImportError:
        return "OCR is not installed. File saved; please manually confirm its contents. Install Pillow, pytesseract and Tesseract OCR to enable image text extraction."
    except Exception:
        return "Could not read this image. Please check the original document and confirm details manually."
