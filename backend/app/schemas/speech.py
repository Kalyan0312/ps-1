from pydantic import BaseModel, Field
from typing import Optional

class ExtractedEntities(BaseModel):
    service: str = Field(..., description="Detected service category e.g. Plumber, Electrician, Carpenter")
    problem: str = Field(..., description="Summary of the customer's problem or requirement")
    time_slot: str = Field(default="Today", description="Detected time urgency e.g. Today, Immediate, Tomorrow")
    category_id: Optional[str] = None
    estimated_base_rate: Optional[float] = 250.0

class TranscriptionRequest(BaseModel):
    text_input: Optional[str] = Field(None, description="Direct text input for intent extraction or testing")
    language_code: Optional[str] = Field(default="en-IN", description="BCP-47 language tag")

class TranscriptionResponse(BaseModel):
    transcript: str
    confidence: float
    detected: ExtractedEntities
    original_input: str
