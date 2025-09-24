import { Injectable } from '@angular/core';

import { AnswerFeedback, QuizQuestion, QuizSession } from '../../../core/models/quiz.models';

export const DEMO_SESSION_ID = 'demo-session';
const CORRECT_OPTION_ID = 'option-201';

const BASE_SESSION: QuizSession = {
  id: DEMO_SESSION_ID,
  startedAt: '',
  questionCount: 1
};

const BASE_QUESTION: QuizQuestion = {
  id: 'demo-question',
  prompt: 'Which HTTP status code indicates that a resource was created successfully?',
  options: [
    { id: 'option-200', label: '200 OK' },
    { id: 'option-201', label: '201 Created' },
    { id: 'option-301', label: '301 Moved Permanently' },
    { id: 'option-500', label: '500 Internal Server Error' }
  ]
};

@Injectable({ providedIn: 'root' })
export class QuizDemoService {
  getSession(): QuizSession {
    return {
      ...BASE_SESSION,
      startedAt: new Date().toISOString()
    };
  }

  getQuestion(): QuizQuestion {
    return {
      ...BASE_QUESTION,
      options: BASE_QUESTION.options.map((option) => ({ ...option }))
    };
  }

  evaluateAnswer(optionId: string, session: QuizSession): AnswerFeedback {
    const correct = optionId === CORRECT_OPTION_ID;
    return {
      correct,
      explanation: correct
        ? '201 Created confirms that the backend successfully persisted your new resource.'
        : 'The backend would reply with 201 Created for a resource creation request.',
      session
    };
  }
}
