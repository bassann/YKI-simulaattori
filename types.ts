
export enum TestLevel {
  PERUSTASO = 'perustaso',
  KESKITASO = 'keskitaso'
}

export enum TestPart {
  READING = 'Luetun ymmärtäminen',
  LISTENING = 'Kuullun ymmärtäminen',
  WRITING = 'Kirjoittaminen',
  SPEAKING = 'Puhuminen'
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
  audioPrompt: string;
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
  speaking: Record<number, any | null>;
}
