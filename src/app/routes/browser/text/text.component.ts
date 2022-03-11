import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

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

  constructor(
    public router: Router,
    public dataService: DataService,
    private notificationService: NotificationService,
    private eventService: EventService,
    private matDialog: MatDialog,
  ) {
    this.eventService.isEditing = true;
    if (this.dataService.file) {
      this.content = this.dataService.file.text;
    } else {
      this.close();
    }
    this.keyboardEvents();
  }

  save(): void {
    this.dataService.file.text = this.content;
    this.dataService.file.update();
    this.dataService.modify();
    this.notificationService.success('File saved');
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
    this.dataService.file = undefined;
    this.eventService.isEditing = false;
    this.keySub.unsubscribe();
  }
}
