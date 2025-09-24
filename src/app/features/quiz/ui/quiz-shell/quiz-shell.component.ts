import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';

import { QuizApiService } from '../../../../core/services/quiz-api.service';
import { DEMO_SESSION_ID, QuizDemoService } from '../../data/quiz-demo.service';
import {
  AnswerFeedback,
  QuestionResponse,
  QuizQuestion,
  QuizSession,
  SubmitAnswerRequest
} from '../../../../core/models/quiz.models';

@Component({
  selector: 'app-quiz-shell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-shell.component.html',
  styleUrl: './quiz-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizShellComponent implements OnInit {
  private readonly api = inject(QuizApiService);
  private readonly demo = inject(QuizDemoService);

  readonly session = signal<QuizSession | null>(null);
  readonly question = signal<QuizQuestion | null>(null);
  readonly selectedOptionId = signal<string | null>(null);
  readonly feedback = signal<AnswerFeedback | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  readonly canSubmit = computed(
    () => !this.isLoading() && !!this.question() && !!this.selectedOptionId()
  );

  ngOnInit(): void {
    this.startNewSession();
  }

  startNewSession(): void {
    this.resetViewState();
    this.isLoading.set(true);
    this.api.startSession({}).subscribe({
      next: (session) => {
        this.session.set(session);
        this.loadNextQuestion(session.id);
      },
      error: () => {
        this.useDemoFallback('Backend not reachable. Demo question loaded.');
      }
    });
  }

  selectOption(optionId: string): void {
    this.selectedOptionId.set(optionId);
  }

  submitAnswer(): void {
    const session = this.session();
    const question = this.question();
    const selectedOptionId = this.selectedOptionId();

    if (!session || !question || !selectedOptionId || this.isLoading()) {
      return;
    }

    if (session.id === DEMO_SESSION_ID) {
      this.feedback.set(this.demo.evaluateAnswer(selectedOptionId, session));
      this.selectedOptionId.set(null);
      return;
    }

    const payload: SubmitAnswerRequest = {
      questionId: question.id,
      selectedOptionId
    };

    this.isLoading.set(true);
    this.api.submitAnswer(session.id, payload).subscribe({
      next: (response) => {
        this.feedback.set(response);
        this.selectedOptionId.set(null);
        this.isLoading.set(false);
        if (response.nextQuestion) {
          this.question.set(response.nextQuestion);
        } else {
          this.loadNextQuestion(session.id);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Could not submit your answer. Please try again.');
      }
    });
  }

  loadNextQuestion(sessionId: string): void {
    this.isLoading.set(true);
    this.api.loadNextQuestion(sessionId).subscribe({
      next: (result: QuestionResponse) => {
        this.session.set(result.session);
        this.question.set(result.question);
        this.feedback.set(null);
        this.selectedOptionId.set(null);
        this.errorMessage.set(null);
        this.isLoading.set(false);
      },
      error: () => {
        this.useDemoFallback('Could not load questions. Demo question loaded.');
      }
    });
  }

  clearFeedback(): void {
    this.feedback.set(null);
  }

  private resetViewState(): void {
    this.question.set(null);
    this.feedback.set(null);
    this.errorMessage.set(null);
    this.selectedOptionId.set(null);
  }

  private useDemoFallback(message: string): void {
    this.session.set(this.demo.getSession());
    this.question.set(this.demo.getQuestion());
    this.feedback.set(null);
    this.selectedOptionId.set(null);
    this.isLoading.set(false);
    this.errorMessage.set(message);
  }
}
