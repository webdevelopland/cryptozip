import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { EventService, DataService, NotificationService } from '@/core/services';

@Component({
  selector: 'pow-dialog',
  templateUrl: './pow-dialog.component.html',
  styleUrls: ['./pow-dialog.component.scss'],
})
export class PowDialogComponent implements OnDestroy {
  newPow: number;
  keySub = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<PowDialogComponent>,
    private eventService: EventService,
    private dataService: DataService,
    private notificationService: NotificationService,
  ) {
    this.eventService.isDialog = true;
    this.newPow = this.dataService.pow;
    this.subscribeOnKeydown();
  }

  private subscribeOnKeydown(): void {
    this.keySub = this.eventService.keydown.subscribe((event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter': this.save();
      }
    });
  }

  save(): void {
    if (this.newPow && this.newPow > 0 && this.newPow < 21) {
      this.dataService.pow = this.newPow;
      this.dataService.modify();
      this.notificationService.success('Updated: PoW');
      this.dialogRef.close();
    } else {
      this.notificationService.warning('PoW invalid');
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.keySub.unsubscribe();
    this.eventService.isDialog = false;
  }
}
