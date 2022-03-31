import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { EventService, NotificationService, DataService } from '@/core/services';
import { Node } from '@/core/type';
import { GetService } from '../../services/get.service';

@Component({
  selector: 'index-dialog',
  templateUrl: './index-dialog.component.html',
  styleUrls: ['./index-dialog.component.scss'],
})
export class IndexDialogComponent implements OnDestroy {
  index: string;
  keySubscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<IndexDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public node: Node,
    private eventService: EventService,
    private notificationService: NotificationService,
    private getService: GetService,
    private dataService: DataService,
  ) {
    this.eventService.isDialog = true;
    this.index = this.node.index.toString();
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
    this.dialogRef.close(parseInt(this.index));
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.keySubscription.unsubscribe();
    this.eventService.isDialog = false;
  }
}
