import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DialogData } from '@/core/type';
import { EventService } from '@/core/services';

@Component({
  selector: 'info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.scss'],
})
export class InfoDialogComponent implements OnDestroy {
  constructor(
    private dialogRef: MatDialogRef<InfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogData,
    private eventService: EventService,
  ) {
    this.eventService.isDialog = true;
  }

  ok(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.eventService.isDialog = false;
  }
}
