import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, interval } from 'rxjs';

import { DataService, NotificationService, EventService, LocationService } from '@/core/services';
import { ConfirmDialogComponent } from '@/shared/dialogs';

@Component({
  selector: 'page-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
})
export class TextComponent implements OnDestroy {
  content: string;
  keySub = new Subscription();
  timerSub = new Subscription();

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
      this.content = this.locationService.file.text;
      this.keyboardEvents();
      this.checkModified();
    } else {
      this.notificationService.error('File not found');
      this.locationService.cancel();
      this.close();
    }
  }

  save(): void {
    this.locationService.file.text = this.content;
    this.locationService.updateNode(this.locationService.file);
    this.dataService.modify();
    this.dataService.isFileModified = false;
    this.notificationService.success('File saved');
  }

  checkModified(): void {
    this.timerSub = interval(1000).subscribe(() => {
      this.dataService.isFileModified = this.content !== this.locationService.file.text;
    });
  }

  askClose(): void {
    this.ask(() => this.close());
  }

  askBack(): void {
    this.ask(() => this.locationService.back());
  }

  ask(callback: Function): void {
    if (this.locationService.file.text === this.content) {
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
    this.timerSub.unsubscribe();
  }
}
