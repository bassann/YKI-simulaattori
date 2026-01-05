
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TestLevel, FullTest } from "../types";

export const generateTestContent = async (level: TestLevel): Promise<FullTest> => {
  // Always create a fresh instance right before use to capture the latest session key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a full, realistic Finnish YKI mock test for level: ${level}. 
    
    CRITICAL RULES for Listening Tasks:
    - The 'audioPrompt' MUST be a clean script of ONLY the Finnish text to be read.
    - It must start with an introduction: 'Tehtävä 1. Kuuntele seuraava teksti ja vastaa kysymyksiin.'
    - The main content must be a substantial passage (dialogue, news, or announcement).
    - Length: Perustaso ~50-70 words, Keskitaso ~100-130 words.
    
    CRITICAL RULES for Other Tasks:
    - 2 Reading tasks: Title, text (~150-300 words), and 3 multiple choice questions.
    - 2 Writing tasks: A clear prompt and a high-quality model answer.
    - 2 Speaking tasks: A scenario for the user.
    
    Ensure all Finnish language is at the ${level} level.`,
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
                transcript: { type: Type.STRING },
                audioPrompt: { type: Type.STRING },
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
  if (!base64Audio) {
    throw new Error("No audio data returned from model");
  }
  
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
  const dataInt16 = new Int16Array(data.buffer);
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
