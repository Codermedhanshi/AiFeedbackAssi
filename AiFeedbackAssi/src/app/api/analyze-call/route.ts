// app/api/analyze-call/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio, analyzeCall } from '../../../../lib/aiService';

export const runtime = 'nodejs';            // ✅ Needed for Whisper
export const maxDuration = 120;             // Increase timeout if needed

export async function POST(request: NextRequest) {
  try {
    // 1️⃣ Parse multipart/form-data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // 2️⃣ Validate MIME type and extension
    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav'];
    const isValidMime = validTypes.includes(audioFile.type);
    const isValidExt = /\.(mp3|wav)$/i.test(audioFile.name);

    if (!isValidMime || !isValidExt) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Upload MP3 or WAV only.' },
        { status: 400 }
      );
    }

    // 3️⃣ Check size limit (25 MB for Whisper)
    const maxSizeMB = 25;
    if (audioFile.size > maxSizeMB * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: `File too large (max ${maxSizeMB} MB).` },
        { status: 400 }
      );
    }

    // 4️⃣ Convert to Node Buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // 5️⃣ Check API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        { success: false, error: 'Server misconfiguration: missing OpenAI API key.' },
        { status: 500 }
      );
    }

    // 6️⃣ Transcribe and analyze
    const transcript = await transcribeAudio(audioBuffer, audioFile.name);
    const analysis = await analyzeCall(transcript);

    return NextResponse.json({ success: true, data: analysis });

  } catch (err: unknown) {
     // 7️⃣ Handle and log error
     console.error('Transcription/Analysis error:', err);

     const errorMessage = err instanceof Error
       ? err.message
       : 'Unknown error occurred while processing audio.';
 
     return NextResponse.json(
       { success: false, error: errorMessage },
       { status: 500 }
     );
   }
 }