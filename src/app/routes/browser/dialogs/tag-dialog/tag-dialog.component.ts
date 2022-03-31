import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { EventService, NotificationService, DataService } from '@/core/services';
import { Node } from '@/core/type';
import { GetService } from '../../services/get.service';

@Component({
  selector: 'tag-dialog',
  templateUrl: './tag-dialog.component.html',
  styleUrls: ['./tag-dialog.component.scss'],
})
export class TagDialogComponent implements OnDestroy {
  tags: string;
  keySubscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<TagDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public node: Node,
    private eventService: EventService,
    private notificationService: NotificationService,
    private getService: GetService,
    private dataService: DataService,
  ) {
    this.eventService.isDialog = true;
    this.tags = this.node.tags.join(' ');
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
    this.dialogRef.close(this.tags.toLowerCase().split(' '));
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.keySubscription.unsubscribe();
    this.eventService.isDialog = false;
  }
}
