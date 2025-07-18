import io
import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

load_dotenv()
CLIENT_URL = os.getenv("CLIENT_URL")

from helper import  load_image_from_upload, \
                    extract_text_with_ocr, \
                    detect_pii_in_ocr_data, \
                    mask_pii_regions, \
                    image_to_bytes

app = FastAPI(title="PII Redaction API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CLIENT_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/mask-pii/")
async def mask_pii_endpoint(
    file: UploadFile = File(...),
):
    """
    Endpoint to upload image and get back PII-masked version.
    
    Args:
        file: Image file (jpg, png, jpeg)
    
    Returns:
        StreamingResponse with masked image
    """
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Load image
        image = load_image_from_upload(file)
        
        # Extract text with OCR
        ocr_data = extract_text_with_ocr(image)
        
        # Detect PII
        pii_detections = detect_pii_in_ocr_data(ocr_data)
        
        # Mask PII regions

        masked_image = mask_pii_regions(image, pii_detections)
        
        # Convert to bytes
        img_bytes = image_to_bytes(masked_image)
        
        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(img_bytes),
            media_type="image/png",
            headers={
                "Content-Disposition": "attachment; filename=masked_image.png",
                "X-PII-Detected": str(len(pii_detections))
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@app.post("/analyze-pii/")
async def analyze_pii_endpoint(file: UploadFile = File(...)):
    """
    Analyze image for PII without masking - returns JSON with detected PII info.
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Load image
        image = load_image_from_upload(file)
        
        # Extract text with OCR
        ocr_data = extract_text_with_ocr(image)
        
        # Detect PII
        pii_detections = detect_pii_in_ocr_data(ocr_data)
        
        # Return analysis results
        return {
            "total_text_regions": len(ocr_data),
            "pii_detections": len(pii_detections),
            "detected_pii": [
                {
                    "text": detection['text'],
                    "pii_types": detection['pii_types'],
                    "bbox": detection['bbox']
                }
                for detection in pii_detections
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "PII Redaction API",
        "version": "1.0.0",
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "ocr_ready": True, "nlp_ready": True}

