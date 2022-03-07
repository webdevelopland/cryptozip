import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { timer, Subscription } from 'rxjs';

import { InfoDialogComponent } from '@/shared/dialogs';

@Injectable()
export class NotificationService {
  message: string;
  color: string;
  timerSub = new Subscription();

  constructor(
    private matDialog: MatDialog,
  ) { }

  private snack(message: string, color: string): void {
    if (message) {
      this.message = message;
      this.color = color;
      this.timerSub.unsubscribe();
      this.timerSub = timer(2000).subscribe(() => {
        this.message = undefined;
        this.color = undefined;
      });
    }
  }

  success(message: string): void {
    this.snack(message, '#37d437');
  }

  error(message: string): void {
    this.snack(message, '#e83636');
  }

  warning(message: string): void {
    this.snack(message, '#ffb818');
  }

  crash(message: string): void {
    this.error(message);
    throw new Error(message);
  }

  info(message: string): void {
    this.matDialog.open(InfoDialogComponent, {
      autoFocus: false,
      data: { message: message },
    });
  }
}
