export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
}

export interface QuizSession {
  id: string;
  startedAt: string;
  questionCount: number;
}

export interface StartSessionRequest {
  topic?: string;
}

export interface QuestionResponse {
  session: QuizSession;
  question: QuizQuestion;
}

export interface SubmitAnswerRequest {
  questionId: string;
  selectedOptionId: string;
}

export interface AnswerFeedback {
  correct: boolean;
  explanation?: string;
  nextQuestion?: QuizQuestion;
  session: QuizSession;
}
