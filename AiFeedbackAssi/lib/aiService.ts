import OpenAI from 'openai';
import { evaluationParameters } from './evaluationParams';
import { FeedbackResponse } from '../types';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function transcribeAudio(audioBuffer: Buffer, fileName: string): Promise<string> {
  const tempPath = path.join(os.tmpdir(), `${Date.now()}-${fileName}`);
  await writeFile(tempPath, audioBuffer);

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: 'whisper-1',
      language: 'en',
    });

    return transcription.text;
  } catch (error) {
    if (error && typeof error === "object") {
      const errObj = error as { response?: { data?: unknown }; message?: string };
      console.error('Transcription error:', errObj.response?.data || errObj.message || error);
    } else {
      console.error('Transcription error:', error);
    }
    throw new Error('Failed to transcribe audio');
  } finally {
    try {
      await unlink(tempPath);
    } catch {
      console.warn('Failed to delete temp file:', tempPath);
    }
  }
}

export async function analyzeCall(transcription: string): Promise<FeedbackResponse> {
  const prompt = `
You are an AI evaluator for debt collection calls. Analyze the following call transcription and provide scores based on these parameters:

${evaluationParameters.map(param =>
    `${param.name} (${param.key}): ${param.desc} - Weight: ${param.weight} - Type: ${param.inputType}`
  ).join('\n')}

SCORING RULES:
- For PASS_FAIL parameters: Score should be either 0 or equal to the weight
- For SCORE parameters: Score can be any number between 0 and the weight

Call Transcription:
"${transcription}"

Return ONLY a valid JSON object with this exact structure:
{
  "scores": {
    "greeting": number,
    "collectionUrgency": number,
    "rebuttalCustomerHandling": number,
    "callEtiquette": number,
    "callDisclaimer": number,
    "correctDisposition": number,
    "callClosing": number,
    "fatalIdentification": number,
    "fatalTapeDiscloser": number,
    "fatalToneLanguage": number
  },
  "overallFeedback": "string",
  "observation": "string"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned by OpenAI');
    }

    const result = JSON.parse(content) as FeedbackResponse;

    // Optional: Add schema validation here

    return result;
  } catch (error) {
    console.error('Analysis error:', (error as Error).message || error);
    throw new Error('Failed to analyze call');
  }
}
