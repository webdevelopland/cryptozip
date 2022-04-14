import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import * as AES from 'src/third-party/aes';

import { DataService, NotificationService, EventService, LocationService } from '@/core/services';
import { compareBinary } from '@/core/functions';
import { ConfirmDialogComponent } from '@/shared/dialogs';

@Component({
  selector: 'page-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
})
export class TextComponent implements OnDestroy {
  content: string;
  keySub = new Subscription();
  fileSub = new Subscription();

  constructor(
    public router: Router,
    private matDialog: MatDialog,
    public dataService: DataService,
    private notificationService: NotificationService,
    private eventService: EventService,
    public locationService: LocationService,
  ) {
    this.eventService.isEditing = true;
    this.start();
  }

  start(): void {
    if (this.locationService.file) {
      this.dataService.decryptFile(this.locationService.file);
      this.locationService.updateParent(this.locationService.file);
      this.content = AES.utils.utf8.fromBytes(this.locationService.file.block.binary);
      this.keyboardEvents();
      this.checkModified();
    } else {
      this.notificationService.error('File not found');
      this.locationService.cancel();
      this.close();
    }
  }

  save(): void {
    try {
      this.locationService.file.block.binary = AES.utils.utf8.toBytes(this.content);
      this.locationService.updateNodeAndAllParents(this.locationService.file);
      this.dataService.modifyAndRefresh();
      this.dataService.isFileModified = false;
      this.notificationService.success('File saved');
    } catch (e) {
      this.notificationService.error('Invalid data');
    }
  }

  checkModified(): void {
    this.fileSub = this.dataService.fileChanges.subscribe(() => {
      this.dataService.isFileModified = !this.compare();
    });
  }

  compare(): boolean {
    try {
      return compareBinary(
        AES.utils.utf8.toBytes(this.content),
        this.locationService.file.block.binary
      );
    } catch (e) {
      return false;
    }
  }

  askClose(): void {
    this.ask(() => this.close());
  }

  askBack(): void {
    this.ask(() => this.locationService.back());
  }

  ask(callback: Function): void {
    if (this.compare()) {
      callback();
    } else {
      this.matDialog.open(ConfirmDialogComponent, {
        data: { message: 'You have unsaved progress. Close?' },
        autoFocus: false,
      }).afterClosed().subscribe(confirm => {
        if (confirm) {
          callback();
        }
      });
    }
  }

  keyboardEvents(): void {
    this.keySub = this.eventService.keydown.subscribe(event => {
      if (event.code === 'KeyS' && event.ctrlKey) {
        event.preventDefault();
        this.save();
      }
    });
  }

  close(): void {
    this.locationService.updatePath(this.locationService.folder);
    this.router.navigate(['/browser']);
  }

  ngOnDestroy() {
    this.eventService.isEditing = false;
    this.dataService.isFileModified = false;
    this.keySub.unsubscribe();
    this.fileSub.unsubscribe();
  }
}
