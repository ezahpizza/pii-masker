import io
import re
import cv2
import numpy as np
import easyocr
import spacy
from fastapi import File, UploadFile, HTTPException
from PIL import Image
from typing import List, Tuple, Dict, Any

ocr_reader = easyocr.Reader(['en', 'hi'])

# Load SpaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    raise RuntimeError("SpaCy model 'en_core_web_sm' not found. Install with: python -m spacy download en_core_web_sm")

# PII detection patterns
PII_PATTERNS = [
    (r'\b\d{4}\s*\d{4}\s*\d{4}\b', 'AADHAAR'),           # Aadhaar with spaces
    (r'\b\d{12}\b', 'AADHAAR'),                          # Aadhaar without spaces
    (r'\b[6-9]\d{9}\b', 'PHONE'),                        # Indian phone numbers
    (r'\b\d{10}\b', 'PHONE'),                            # General 10-digit phone
    (r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', 'EMAIL'),  # Email
    (r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b', 'DATE'),     # Date formats
    (r'\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b', 'DATE'),  # Date with month names
]

def load_image_from_upload(file: UploadFile) -> np.ndarray:
    """Load image from uploaded file and convert to OpenCV format."""
    try:
        # Read file content
        contents = file.file.read()
        
        # Convert to PIL Image
        pil_image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if needed
        if pil_image.mode != 'RGB':
            pil_image = pil_image.convert('RGB')
        
        # Convert to OpenCV format (BGR)
        cv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        
        return cv_image
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error loading image: {str(e)}")

def extract_text_with_ocr(image: np.ndarray) -> List[Dict[str, Any]]:
    """Extract text and bounding boxes using EasyOCR."""
    try:
        # EasyOCR returns [bbox, text, confidence]
        results = ocr_reader.readtext(image)
        
        ocr_data = []
        for bbox, text, confidence in results:
            # Convert bbox to (x, y, width, height) format
            bbox_array = np.array(bbox)
            x_min = int(bbox_array[:, 0].min())
            y_min = int(bbox_array[:, 1].min())
            x_max = int(bbox_array[:, 0].max())
            y_max = int(bbox_array[:, 1].max())
            
            ocr_data.append({
                'text': text,
                'bbox': (x_min, y_min, x_max - x_min, y_max - y_min),
                'confidence': confidence,
                'coordinates': bbox
            })
        
        return ocr_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR extraction failed: {str(e)}")

def detect_pii_with_regex(text: str) -> List[Tuple[str, str]]:
    """Detect PII using regex patterns."""
    pii_matches = []
    
    for pattern, pii_type in PII_PATTERNS:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            pii_matches.append((match.group(), pii_type))
    
    return pii_matches

def detect_pii_with_spacy(text: str) -> List[Tuple[str, str]]:
    """Detect PII using SpaCy NER."""
    doc = nlp(text)
    pii_matches = []
    
    # Define PII entity types
    pii_entities = {'PERSON', 'GPE', 'DATE', 'ORG', 'MONEY', 'CARDINAL'}
    
    for ent in doc.ents:
        if ent.label_ in pii_entities:
            pii_matches.append((ent.text, ent.label_))
    
    return pii_matches

def detect_pii_in_ocr_data(ocr_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Detect PII in OCR extracted text and return with bounding boxes."""
    pii_detections = []
    
    for item in ocr_data:
        text = item['text']
        bbox = item['bbox']
        
        # Detect PII using regex
        regex_matches = detect_pii_with_regex(text)
        
        # Detect PII using SpaCy
        spacy_matches = detect_pii_with_spacy(text)
        
        # Combine all matches
        all_matches = regex_matches + spacy_matches
        
        if all_matches:
            pii_detections.append({
                'text': text,
                'bbox': bbox,
                'pii_types': [match[1] for match in all_matches],
                'pii_values': [match[0] for match in all_matches]
            })
    
    return pii_detections

def mask_pii_regions(image: np.ndarray, pii_detections: List[Dict[str, Any]]) -> np.ndarray:
    """Mask PII regions on the image using black rectangles."""
    masked_image = image.copy()
    
    for detection in pii_detections:
        x, y, w, h = detection['bbox']
        
        # Draw black rectangle to mask PII
        cv2.rectangle(masked_image, (x, y), (x + w, y + h), (0, 0, 0), -1)
        
        # Optional: Add label
        # label = f"[{', '.join(set(detection['pii_types']))}]"
        # cv2.putText(masked_image, label, (x, y - 10), 
        #            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
    
    return masked_image

def image_to_bytes(image: np.ndarray, format: str = 'PNG') -> bytes:
    """Convert OpenCV image to bytes."""
    # Convert BGR to RGB
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Convert to PIL Image
    pil_image = Image.fromarray(rgb_image)
    
    # Save to bytes
    img_bytes = io.BytesIO()
    pil_image.save(img_bytes, format=format)
    img_bytes.seek(0)
    
    return img_bytes.getvalue()