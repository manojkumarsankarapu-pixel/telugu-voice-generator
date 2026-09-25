import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Initializing GoogleGenAI client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Helper to wrap raw 16-bit 24kHz mono PCM in a standard RIFF/WAV header
 */
function pcmToWavBuffer(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  // If already WAV (starts with 'RIFF')
  if (pcmBuffer.length > 4 && pcmBuffer.toString('ascii', 0, 4) === 'RIFF') {
    return pcmBuffer;
  }

  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  // RIFF chunk descriptor
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);

  // "fmt " sub-chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  header.writeUInt16LE(1, 20); // AudioFormat: 1 = PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);

  // "data" sub-chunk
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

/**
 * POST /api/tts
 * Convert text into speech using gemini-3.8-flash-tts
 */
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const {
      text,
      voiceName = 'Puck',
      style = 'Deeply emotional, soft-spoken, cinematic Telugu monologue with heartfelt pauses',
      isMultiSpeaker = false,
      dialogueParts = [],
      speaker1 = { name: 'Kiran', voice: 'Puck', style: 'Emotional, gentle Telugu man' },
      speaker2 = { name: 'Ananya', voice: 'Kore', style: 'Soft, touching Telugu woman' },
    } = req.body;

    if (!text && (!dialogueParts || dialogueParts.length === 0)) {
      return res.status(400).json({ error: 'Text or dialogue parts are required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.',
      });
    }

    let audioBase64: string | undefined;

    if (isMultiSpeaker && dialogueParts.length > 0) {
      // Multi-speaker TTS using gemini-3.8-flash-tts
      const parts = dialogueParts.map((item: { speaker: string; text: string; style?: string }) => ({
        text: `${item.speaker}: ${item.text}`,
        speechMetadata: {
          speaker: item.speaker,
          style: item.style || (item.speaker === speaker1.name ? speaker1.style : speaker2.style),
        },
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: parts,
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: speaker1.name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: speaker1.voice },
                  },
                },
                {
                  speaker: speaker2.name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: speaker2.voice },
                  },
                },
              ],
            },
          },
        },
      });

      audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } else {
      // Single speaker TTS using gemini-3.8-flash-tts
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text,
                speechMetadata: {
                  style: style,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
          },
        },
      });

      audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    }

    if (!audioBase64) {
      return res.status(502).json({ error: 'Failed to generate audio from Gemini TTS.' });
    }

    // Convert raw PCM into playable WAV buffer
    const pcmBuf = Buffer.from(audioBase64, 'base64');
    const wavBuf = pcmToWavBuffer(pcmBuf, 24000, 1, 16);
    const wavBase64 = wavBuf.toString('base64');
    const dataUrl = `data:audio/wav;base64,${wavBase64}`;
    const durationSeconds = pcmBuf.length / (24000 * 2);

    return res.json({
      audioUrl: dataUrl,
      duration: durationSeconds,
      sampleRate: 24000,
    });
  } catch (err: any) {
    console.error('Error generating speech:', err);
    let message = 'Internal server error while generating audio.';
    try {
      if (typeof err?.message === 'string') {
        const parsedErr = JSON.parse(err.message);
        if (parsedErr?.error?.message) {
          message = parsedErr.error.message;
        }
      }
    } catch {
      message = err?.message || 'Internal server error while generating audio.';
    }
    return res.status(500).json({
      error: message,
    });
  }
});

/**
 * POST /api/enhance-script
 * Use gemini-3.8-flash to expand, transliterate, or translate Telugu dialogue
 */
app.post('/api/enhance-script', async (req: Request, res: Response) => {
  try {
    const { action, text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required.' });
    }

    let prompt = '';

    if (action === 'transliterate_and_translate') {
      prompt = `Given the Telugu input text: "${text}"
Please provide:
1. "teluguScript": The text accurately in Telugu script (తెలుగు లిపి).
2. "romanTelugu": The phonetic transliteration in English alphabets (Romanized Telugu) with natural pauses indicated with commas or ellipses.
3. "englishTranslation": Poetic English translation capturing the exact emotional depth.
4. "moodDescription": 1-sentence poetic mood explanation.

Return strictly JSON with keys: teluguScript, romanTelugu, englishTranslation, moodDescription.`;
    } else if (action === 'expand_monologue') {
      prompt = `Given this Telugu quote: "${text}"
Expand this into an emotional 3-4 sentence cinematic movie monologue for a character reflecting on lost time, serendipity, and deep love.
Include vocal burst cues like <breath>, ..., or soft sighs to make it sound vivid when spoken.
Provide both Telugu script and Romanized English script.

Return strictly JSON with keys:
- teluguScript: string (full extended monologue in Telugu script)
- romanTelugu: string (full extended monologue in phonetic English Telugu with natural emotion and <breath> marks)
- englishTranslation: string (English translation)
- suggestedVoice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr'
- suggestedStyle: string (e.g. "Warm nostalgic Telugu whisper with a gentle sigh")`;
    } else if (action === 'create_dialogue') {
      prompt = `Given this quote: "${text}"
Create a touching 2-person cinematic scene between two lovers (Character 1: Kiran, Character 2: Ananya) meeting after years or reminiscing late at night.
Keep it between 3 to 4 turns total.
Use conversational modern Telugu written in Roman script (English alphabet) so Gemini TTS can pronounce it naturally.

Return strictly JSON with keys:
- title: string
- context: string (brief setting, e.g. "Late night train station in Hyderabad")
- dialogue: array of objects { speaker: "Kiran" | "Ananya", text: string, emotion: string }`;
    } else {
      prompt = `Analyze this quote: "${text}" and provide emotional resonance notes in JSON:
{ "analysis": string, "poeticTags": string[] }`;
    }

    // Call Gemini with automatic retry for transient 503 / 429
    let response: any;
    let lastError: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        break;
      } catch (err: any) {
        lastError = err;
        // Wait 1.5s then 3s before retry
        await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
      }
    }

    if (!response && lastError) {
      throw lastError;
    }

    const parsed = JSON.parse(response?.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error enhancing script:', err);
    let message = 'Failed to enhance script.';
    try {
      if (typeof err?.message === 'string') {
        const parsedErr = JSON.parse(err.message);
        if (parsedErr?.error?.message) {
          message = parsedErr.error.message;
        }
      }
    } catch {
      message = err?.message || 'Failed to enhance script.';
    }
    return res.status(500).json({
      error: message,
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
