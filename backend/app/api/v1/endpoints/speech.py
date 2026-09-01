import logging
from fastapi import APIRouter, Request, HTTPException, status, Depends
from typing import Optional
import json

from app.schemas.speech import TranscriptionRequest, TranscriptionResponse
from app.services.speech_service import transcribe_audio_or_text
from app.core.rate_limit import rate_limit_sensitive

router = APIRouter()
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# UPLOAD VALIDATION CONSTANTS
# ──────────────────────────────────────────────────────────────────────────────
MAX_AUDIO_BYTES = 10 * 1024 * 1024   # 10 MB
MAX_TEXT_LENGTH = 1_000               # characters
ALLOWED_AUDIO_MIME_PREFIXES = (
    "audio/wav", "audio/mpeg", "audio/webm",
    "audio/ogg", "audio/mp4", "audio/x-m4a",
    "application/octet-stream"
)

@router.post(
    "/transcribe",
    response_model=TranscriptionResponse,
    summary="Transcribe customer voice and extract service, problem, and time intent"
)
async def transcribe_speech(
    request: Request,
    _rate: bool = Depends(rate_limit_sensitive(max_requests=25, window_seconds=60))
):
    content_type = request.headers.get("content-type", "")

    text_input: Optional[str] = None
    language_code = "en-IN"
    audio_bytes: Optional[bytes] = None

    if "application/json" in content_type:
        body = await request.json()
        text_input = body.get("text_input", "")

        # Validate text input length
        if text_input and len(text_input) > MAX_TEXT_LENGTH:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Text input exceeds maximum allowed length of {MAX_TEXT_LENGTH} characters."
            )

        language_code = body.get("language_code", "en-IN")

    elif "multipart/form-data" in content_type:
        form = await request.form()
        text_input = form.get("text_prompt")

        # Validate text prompt length
        if text_input and len(str(text_input)) > MAX_TEXT_LENGTH:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Text prompt exceeds maximum allowed length."
            )

        audio_field = form.get("audio_file")
        if audio_field and hasattr(audio_field, "read"):
            # Validate MIME type
            file_content_type = getattr(audio_field, "content_type", "")
            if file_content_type and not any(
                file_content_type.startswith(m) for m in ALLOWED_AUDIO_MIME_PREFIXES
            ):
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail=f"Unsupported audio format '{file_content_type}'. Allowed: WAV, MP3, WebM, OGG, MP4."
                )

            audio_bytes = await audio_field.read()

            # Validate file size
            if len(audio_bytes) > MAX_AUDIO_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="Audio file exceeds maximum allowed size of 10 MB."
                )

    else:
        # Raw text fallback
        raw_body = await request.body()
        if raw_body:
            try:
                data = json.loads(raw_body.decode())
                text_input = data.get("text_input", "")
            except Exception:
                text_input = raw_body.decode()

            if text_input and len(text_input) > MAX_TEXT_LENGTH:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="Text input exceeds maximum allowed length."
                )

    try:
        result = await transcribe_audio_or_text(
            audio_bytes=audio_bytes,
            text_input=text_input,
            language_code=language_code
        )
        return result
    except Exception as e:
        logger.error(f"Transcription error (no PII logged): {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Speech transcription service is temporarily unavailable."
        )

