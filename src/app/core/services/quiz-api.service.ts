import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AnswerFeedback,
  QuestionResponse,
  QuizSession,
  StartSessionRequest,
  SubmitAnswerRequest
} from '../models/quiz.models';

@Injectable({ providedIn: 'root' })
export class QuizApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/quiz';

  startSession(body: StartSessionRequest): Observable<QuizSession> {
    return this.http.post<QuizSession>(`${this.baseUrl}/sessions`, body);
  }

  loadNextQuestion(sessionId: string): Observable<QuestionResponse> {
    return this.http.get<QuestionResponse>(`${this.baseUrl}/sessions/${sessionId}/current`);
  }

  submitAnswer(sessionId: string, body: SubmitAnswerRequest): Observable<AnswerFeedback> {
    return this.http.post<AnswerFeedback>(`${this.baseUrl}/sessions/${sessionId}/answers`, body);
  }
}
