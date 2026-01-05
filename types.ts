
export enum TestLevel {
  PERUSTASO = 'perustaso',
  KESKITASO = 'keskitaso'
}

export enum TestPart {
  READING = 'Reading',
  LISTENING = 'Listening',
  WRITING = 'Writing',
  SPEAKING = 'Speaking'
}

export interface Question {
  id: string;
  text: string;
  options?: string[];
  correctAnswer: string;
}

export interface ReadingTask {
  title: string;
  text: string;
  questions: Question[];
  sampleModelAnswer: string;
}

export interface ListeningTask {
  transcript: string;
  audioPrompt: string; // Text to be converted to TTS
  questions: Question[];
}

export interface WritingTask {
  prompt: string;
  context: string;
  sampleModelAnswer: string;
}

export interface SpeakingTask {
  prompt: string;
  context: string;
}

export interface FullTest {
  level: TestLevel;
  reading: ReadingTask[];
  listening: ListeningTask[];
  writing: WritingTask[];
  speaking: SpeakingTask[];
}

export interface UserAnswers {
  reading: Record<string, string>;
  listening: Record<string, string>;
  writing: Record<number, string>;
  speaking: Record<number, Blob | null>;
}
