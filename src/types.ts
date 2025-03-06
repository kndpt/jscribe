export type Language = 'javascript' | 'typescript';

export interface Snippet {
  id: string;
  title: string;
  content: string;
  language: Language;
  createdAt: string;
  updatedAt: string;
}
