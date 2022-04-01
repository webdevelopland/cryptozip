import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { generateId } from '@/core/functions';
import { EventService } from '@/core/services';

@Component({
  selector: 'id-dialog',
  templateUrl: './id-dialog.component.html',
  styleUrls: ['./id-dialog.component.scss'],
})
export class IdDialogComponent implements OnDestroy {
  id: string;
  keySubscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<IdDialogComponent>,
    private eventService: EventService,
  ) {
    this.eventService.isDialog = true;
    this.subscribeOnKeydown();
    this.randomize();
  }

  private subscribeOnKeydown(): void {
    this.keySubscription = this.eventService.keydown.subscribe((event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter': this.save();
      }
    });
  }

  randomize(): void {
    this.id = generateId();
  }

  save(): void {
    this.dialogRef.close(this.id);
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.keySubscription.unsubscribe();
    this.eventService.isDialog = false;
  }
}
