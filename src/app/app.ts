import { Component } from '@angular/core';

import { QuizShellComponent } from './features/quiz/ui/quiz-shell/quiz-shell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [QuizShellComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
