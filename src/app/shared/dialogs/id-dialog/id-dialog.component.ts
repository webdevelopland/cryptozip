import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { generateId } from '@/core/functions';
import { EventService, DataService, NotificationService } from '@/core/services';

@Component({
  selector: 'id-dialog',
  templateUrl: './id-dialog.component.html',
  styleUrls: ['./id-dialog.component.scss'],
})
export class IdDialogComponent implements OnDestroy {
  startId: string;
  id: string;
  isError: boolean = false;
  keySub = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<IdDialogComponent>,
    private eventService: EventService,
    private dataService: DataService,
    private notificationService: NotificationService,
  ) {
    this.eventService.isDialog = true;
    this.subscribeOnKeydown();
    this.startId = this.dataService.tree.meta.id;
    this.id = this.dataService.tree.meta.id;
  }

  private subscribeOnKeydown(): void {
    this.keySub = this.eventService.keydown.subscribe((event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter': this.save();
      }
    });
  }

  randomize(): void {
    this.id = generateId();
    this.isError = false;
  }

  save(): void {
    if (this.id === this.startId) {
      this.isError = true;
      this.notificationService.warning('New id and old id should be different');
    } else if (!this.id || !this.id.trim()) {
      this.isError = true;
      this.notificationService.warning('Empty id is invalid');
    } else {
      this.dialogRef.close(this.id);
    }
  }

  onChange(): void {
    this.isError = false;
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.keySub.unsubscribe();
    this.eventService.isDialog = false;
  }
}
