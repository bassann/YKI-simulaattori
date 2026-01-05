
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TestLevel, FullTest } from "../types";

const API_KEY = process.env.API_KEY || "";

export const generateTestContent = async (level: TestLevel): Promise<FullTest> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a full, realistic Finnish YKI mock test for level: ${level}. 
    
    CRITICAL RULES for Listening Tasks:
    - The 'audioPrompt' MUST be a complete script for a TTS engine. 
    - It must start with an introduction (e.g., 'Tehtävä 1. Kuuntele seuraava keskustelu ja vastaa kysymyksiin.').
    - The main content must be a substantial passage (dialogue, news report, or announcement) containing specific details that allow answering 3 separate multiple-choice questions.
    - For Perustaso, the passage should be ~60 words. For Keskitaso, ~120 words.
    - Do NOT just generate a single sentence.
    
    CRITICAL RULES for Other Tasks:
    - 2 Reading tasks: Title, long text (~150-300 words), and 3 multiple choice questions.
    - 2 Writing tasks: A prompt (e.g., email to a landlord) and a high-quality model answer for comparison.
    - 2 Speaking tasks: A scenario for the user to respond to.
    
    Ensure all Finnish language used is appropriate for the ${level} level.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          level: { type: Type.STRING },
          reading: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                text: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING },
                      options: { type: Type.ARRAY, items: { type: Type.STRING } },
                      correctAnswer: { type: Type.STRING }
                    },
                    required: ["id", "text", "options", "correctAnswer"]
                  }
                },
                sampleModelAnswer: { type: Type.STRING }
              },
              required: ["title", "text", "questions", "sampleModelAnswer"]
            }
          },
          listening: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                transcript: { type: Type.STRING, description: "The full text version of the audio for review." },
                audioPrompt: { type: Type.STRING, description: "The full script to be read by TTS, including intro and content." },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING },
                      options: { type: Type.ARRAY, items: { type: Type.STRING } },
                      correctAnswer: { type: Type.STRING }
                    },
                    required: ["id", "text", "options", "correctAnswer"]
                  }
                }
              },
              required: ["transcript", "audioPrompt", "questions"]
            }
          },
          writing: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
                context: { type: Type.STRING },
                sampleModelAnswer: { type: Type.STRING }
              },
              required: ["prompt", "context", "sampleModelAnswer"]
            }
          },
          speaking: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
                context: { type: Type.STRING }
              },
              required: ["prompt", "context"]
            }
          }
        },
        required: ["level", "reading", "listening", "writing", "speaking"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateAudio = async (text: string): Promise<Uint8Array> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data generated");
  
  return decode(base64Audio);
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // Ensure the byte length is even for Int16Array
  const bufferToUse = data.byteLength % 2 === 0 
    ? data.buffer 
    : data.slice(0, data.byteLength - 1).buffer;

  const dataInt16 = new Int16Array(bufferToUse);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
