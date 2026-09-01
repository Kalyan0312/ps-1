export interface DetectedEntities {
  service: string;
  problem: string;
  time_slot: string;
  category_id?: string;
  estimated_base_rate?: number;
}

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  detected: DetectedEntities;
  original_input: string;
}

const API_BASE = '/api/v1';

export async function transcribeSpeech(textInput?: string, audioBlob?: Blob): Promise<TranscriptionResult> {
  if (audioBlob) {
    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'recording.wav');
    const res = await fetch(`${API_BASE}/speech/transcribe`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      throw new Error('Failed to transcribe audio from server');
    }
    return res.json();
  }

  const res = await fetch(`${API_BASE}/speech/transcribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text_input: textInput || 'My kitchen tap is leaking. I need a plumber today.',
      language_code: 'en-IN'
    })
  });
  if (!res.ok) {
    throw new Error('Failed to extract voice intent');
  }
  return res.json();
}
