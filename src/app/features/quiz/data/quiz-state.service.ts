import { Injectable, inject, signal, computed } from '@angular/core';
import { catchError, tap, finalize, of } from 'rxjs';

import { QuizApiService } from '../../../core/services/quiz-api.service';
import { QuizDemoService, DEMO_SESSION_ID } from './quiz-demo.service';
import {
  AnswerFeedback,
  QuestionResponse,
  QuizQuestion,
  QuizSession,
  SubmitAnswerRequest
} from '../../../core/models/quiz.models';

@Injectable({ providedIn: 'root' })
export class QuizStateService {
  private readonly api = inject(QuizApiService);
  private readonly demo = inject(QuizDemoService);

  // State signals
  private readonly _session = signal<QuizSession | null>(null);
  private readonly _question = signal<QuizQuestion | null>(null);
  private readonly _selectedOptionId = signal<string | null>(null);
  private readonly _feedback = signal<AnswerFeedback | null>(null);
  private readonly _errorMessage = signal<string | null>(null);
  private readonly _isLoading = signal(false);

  // Public read-only state
  readonly session = this._session.asReadonly();
  readonly question = this._question.asReadonly();
  readonly selectedOptionId = this._selectedOptionId.asReadonly();
  readonly feedback = this._feedback.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // Computed state
  readonly canSubmit = computed(() => 
    !this._isLoading() && 
    Boolean(this._question()) && 
    Boolean(this._selectedOptionId())
  );

  // Actions
  startNewSession(): void {
    this.resetState();
    this._isLoading.set(true);
    
    this.api.startSession({}).pipe(
      tap(session => {
        this._session.set(session);
        this.loadNextQuestion(session.id);
      }),
      catchError(() => {
        this.activateDemoMode('Backend not reachable. Demo question loaded.');
        return of(null);
      })
    ).subscribe();
  }

  selectOption(optionId: string): void {
    this._selectedOptionId.set(optionId);
  }

  submitAnswer(): void {
    const session = this._session();
    const question = this._question();
    const selectedOptionId = this._selectedOptionId();

    if (!session || !question || !selectedOptionId || this._isLoading()) {
      return;
    }

    if (session.id === DEMO_SESSION_ID) {
      this.handleDemoAnswer(selectedOptionId, session);
      return;
    }

    this.handleRealAnswer(session.id, question.id, selectedOptionId);
  }

  clearFeedback(): void {
    this._feedback.set(null);
  }

  // Private methods
  private loadNextQuestion(sessionId: string): void {
    this._isLoading.set(true);
    
    this.api.loadNextQuestion(sessionId).pipe(
      tap((result: QuestionResponse) => {
        this._session.set(result.session);
        this._question.set(result.question);
        this._feedback.set(null);
        this._selectedOptionId.set(null);
        this._errorMessage.set(null);
      }),
      catchError(() => {
        this.activateDemoMode('Could not load questions. Demo question loaded.');
        return of(null);
      }),
      finalize(() => this._isLoading.set(false))
    ).subscribe();
  }

  private handleDemoAnswer(selectedOptionId: string, session: QuizSession): void {
    this._feedback.set(this.demo.evaluateAnswer(selectedOptionId, session));
    this._selectedOptionId.set(null);
  }

  private handleRealAnswer(sessionId: string, questionId: string, selectedOptionId: string): void {
    const payload: SubmitAnswerRequest = { questionId, selectedOptionId };
    
    this._isLoading.set(true);
    this.api.submitAnswer(sessionId, payload).pipe(
      tap(response => {
        this._feedback.set(response);
        this._selectedOptionId.set(null);
        if (response.nextQuestion) {
          this._question.set(response.nextQuestion);
        } else {
          this.loadNextQuestion(sessionId);
        }
      }),
      catchError(() => {
        this._errorMessage.set('Could not submit your answer. Please try again.');
        return of(null);
      }),
      finalize(() => this._isLoading.set(false))
    ).subscribe();
  }

  private resetState(): void {
    this._question.set(null);
    this._feedback.set(null);
    this._errorMessage.set(null);
    this._selectedOptionId.set(null);
  }

  private activateDemoMode(message: string): void {
    this._session.set(this.demo.getSession());
    this._question.set(this.demo.getQuestion());
    this._feedback.set(null);
    this._selectedOptionId.set(null);
    this._isLoading.set(false);
    this._errorMessage.set(message);
  }
}