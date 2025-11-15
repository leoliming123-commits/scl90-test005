export type PageType = 'intro' | 'test' | 'result';

export interface AppState {
  currentPage: PageType;
  answers: { [key: number]: number };
  currentQuestionIndex: number;
}
