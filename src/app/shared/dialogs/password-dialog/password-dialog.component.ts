import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { EventService } from '@/core/services';

@Component({
  selector: 'password-dialog',
  templateUrl: './password-dialog.component.html',
  styleUrls: ['./password-dialog.component.scss'],
})
export class PasswordDialogComponent implements OnDestroy {
  newPass: string;
  keySubscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<PasswordDialogComponent>,
    private eventService: EventService,
  ) {
    this.eventService.isDialog = true;
    this.subscribeOnKeydown();
  }

  private subscribeOnKeydown(): void {
    this.keySubscription = this.eventService.keydown.subscribe((event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter': this.save();
      }
    });
  }

  save(): void {
    this.dialogRef.close(this.newPass);
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.keySubscription.unsubscribe();
    this.eventService.isDialog = false;
  }
}
