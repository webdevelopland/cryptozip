import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { EventService } from '@/core/services';

@Component({
  selector: 'transfer-dialog',
  templateUrl: './transfer-dialog.component.html',
  styleUrls: ['./transfer-dialog.component.scss'],
})
export class TransferDialogComponent implements OnDestroy {
  base64: string;
  keySubscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<TransferDialogComponent>,
    private eventService: EventService,
  ) {
    this.eventService.isDialog = true;
    this.subscribeOnKeydown();
  }

  private subscribeOnKeydown(): void {
    this.keySubscription = this.eventService.keydown.subscribe((event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter': this.paste();
      }
    });
  }

  check(): void {
    if (!this.base64 || !this.base64.trim()) {
      this.close();
    } else {
      this.paste();
    }
  }

  paste(): void {
    this.dialogRef.close(this.base64);
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.keySubscription.unsubscribe();
    this.eventService.isDialog = false;
  }
}
