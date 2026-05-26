export type Vibe = 'earthy' | 'bold' | 'classic' | 'whimsical';
export type Aesthetic = 'cottagecore' | 'minimalist' | 'maximalist' | 'vintage';
export type NamePriority = 'meaning' | 'sound' | 'uniqueness' | 'cultural';
export type GenderDirection = 'girl' | 'boy' | 'neutral' | 'surprise';

export interface QuizAnswers {
  freeformIntro: string;
  vibe: Vibe | null;
  aesthetic: Aesthetic | null;
  priority: NamePriority | null;
  gender: GenderDirection | null;
  familyWord: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface NameSuggestion {
  name: string;
  why: string;
  origin: string;
  tags: string[];
}
