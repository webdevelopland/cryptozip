import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class NotificationService {
  constructor(private snackbar: MatSnackBar) { }

  private snack(message: string, status: string): void {
    if (message) {
      this.snackbar.open(message, undefined, {
        duration: 3000,
        panelClass: [status],
      });
    }
  }

  success(message: string): void {
    this.snack(message, 'notification-success');
  }

  error(message: string): void {
    this.snack(message, 'notification-error');
  }

  warning(message: string): void {
    this.snack(message, 'notification-warning');
  }

  crash(message: string): void {
    this.error(message);
    throw new Error(message);
  }
}
