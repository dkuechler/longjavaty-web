import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { QuizStateService } from '../../data/quiz-state.service';

@Component({
  selector: 'app-quiz-shell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-shell.component.html',
  styleUrl: './quiz-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizShellComponent implements OnInit {
  protected readonly quizState = inject(QuizStateService);

  ngOnInit(): void {
    this.quizState.startNewSession();
  }
}
