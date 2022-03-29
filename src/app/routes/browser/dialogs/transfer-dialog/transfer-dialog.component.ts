import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { EventService, NotificationService } from '@/core/services';

@Component({
  selector: 'transfer-dialog',
  templateUrl: './transfer-dialog.component.html',
  styleUrls: ['./transfer-dialog.component.scss'],
})
export class TransferDialogComponent implements OnDestroy {
  base64: string;
  clipboard: string;
  keySubscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<TransferDialogComponent>,
    private eventService: EventService,
    private notificationService: NotificationService,
  ) {
    this.eventService.isDialog = true;
    this.subscribeOnKeydown();
    this.readClipboard();
  }

  private subscribeOnKeydown(): void {
    this.keySubscription = this.eventService.keydown.subscribe((event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter': this.paste();
      }
    });
  }

  private readClipboard(): void {
    navigator.clipboard.readText()
      .then(clipboard => {
        this.clipboard = clipboard;
      })
      .catch(() => {
        this.notificationService.warning('Clipboard error');
      });
  }

  paste(): void {
    let clipboard: string = this.clipboard;
    if (this.base64 && this.base64.trim()) {
      clipboard = this.base64;
    }
    this.dialogRef.close(clipboard);
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.keySubscription.unsubscribe();
    this.eventService.isDialog = false;
  }
}
