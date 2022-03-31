import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, interval } from 'rxjs';

import { DataService, NotificationService, EventService } from '@/core/services';
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
    public dataService: DataService,
    private notificationService: NotificationService,
    private eventService: EventService,
    private matDialog: MatDialog,
  ) {
    this.eventService.isEditing = true;
    this.start();
  }

  start(): void {
    if (this.dataService.file) {
      this.dataService.decryptThisFile();
      this.content = this.dataService.file.text;
      this.keyboardEvents();
      this.checkModified();
    } else {
      this.notificationService.error('File not found');
      this.close();
    }
  }

  save(): void {
    this.dataService.file.text = this.content;
    this.dataService.updateNode(this.dataService.file);
    this.dataService.modify();
    this.dataService.isFileModified = false;
    this.notificationService.success('File saved');
  }

  checkModified(): void {
    this.timerSub = interval(1000).subscribe(() => {
      this.dataService.isFileModified = this.content !== this.dataService.file.text;
    });
  }

  checkSave(): void {
    if (this.dataService.file.text === this.content) {
      this.close();
    } else {
      this.matDialog.open(ConfirmDialogComponent, {
        data: { message: 'You have unsaved progress. Close?' },
        autoFocus: false,
      }).afterClosed().subscribe(confirm => {
        if (confirm) {
          this.close();
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
    this.router.navigate(['/browser']);
  }

  ngOnDestroy() {
    this.eventService.isEditing = false;
    this.dataService.isFileModified = false;
    this.keySub.unsubscribe();
    this.timerSub.unsubscribe();
  }
}
