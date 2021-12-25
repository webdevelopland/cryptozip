import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { EventService, NotificationService, DataService } from '@/core/services';
import { DialogData } from '@/core/type';
import { GetService } from '../../services/get.service';

@Component({
  selector: 'rename-dialog',
  templateUrl: './rename-dialog.component.html',
  styleUrls: ['./rename-dialog.component.scss'],
})
export class RenameDialogComponent implements OnDestroy {
  newName: string;
  keySubscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<RenameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogData,
    private eventService: EventService,
    private notificationService: NotificationService,
    private getService: GetService,
    private dataService: DataService,
  ) {
    this.newName = dialogData.message;
    this.subscribeOnKeydown();
  }

  private subscribeOnKeydown(): void {
    this.keySubscription = this.eventService.keydown.subscribe((event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter': this.check();
      }
    });
  }

  private rename(): void {
    this.dialogRef.close(this.newName);
  }

  check(): void {
    if (!this.newName.trim()) {
      this.close();
    } else {
      this.checkSlash();
    }
  }

  private checkSlash(): void {
    if (this.hasForbiddenChars(this.newName)) {
      this.notificationService.warning('Forbidden chars: /, \\, <, >, :, ", |, ?, *');
    } else {
      this.checkNoChange();
    }
  }

  hasForbiddenChars(name: string): boolean {
    for (const char of ['/', '\\', '<', '>', ':', '"', '|', '?', '*']) {
      if (name.includes(char)) {
        return true;
      }
    }
    return false;
  }

  private checkNoChange(): void {
    if (this.newName === this.dialogData.message) {
      this.close();
    } else {
      this.checkAlreadyExists();
    }
  }

  private checkAlreadyExists(): void {
    if (this.getService.checkNodeAlreadyExists(this.newName, this.dataService.folder.nodes)) {
      this.notificationService.warning('"' + this.newName + '" already exists');
    } else {
      this.rename();
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.keySubscription.unsubscribe();
  }
}
