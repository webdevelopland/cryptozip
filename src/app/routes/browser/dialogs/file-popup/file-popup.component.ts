import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Location } from '@/core/type';
import { LocationService, DataService, EventService } from '@/core/services';
import { ConfirmDialogComponent } from '@/shared/dialogs';
import { ControlsService, DialogService } from 'browser/services';

@Component({
  selector: 'file-popup',
  templateUrl: './file-popup.component.html',
  styleUrls: ['./file-popup.component.scss'],
})
export class FilePopupComponent implements AfterViewInit {
  @ViewChild('popup') popupRef: ElementRef<HTMLDivElement>;

  constructor(
    private matDialog: MatDialog,
    public controlsService: ControlsService,
    private dialogService: DialogService,
    private dataService: DataService,
    private eventService: EventService,
    public locationService: LocationService,
  ) {
    this.locationService.updateBookmarksPath();
  }

  ngAfterViewInit() {
    this.controlsService.file.overlay = {
      point: {
        x: this.popupRef.nativeElement.offsetLeft,
        y: this.popupRef.nativeElement.offsetTop,
      },
      width: this.popupRef.nativeElement.offsetWidth,
      height: this.popupRef.nativeElement.offsetHeight,
    };
  }

  add(): void {
    this.locationService.addBookmark();
    this.locationService.isBookmark = true;
    setTimeout(() => {
      this.ngAfterViewInit();
    }, 0);
  }

  delete(): void {
    this.locationService.deleteBookmark();
    this.locationService.isBookmark = false;
    setTimeout(() => {
      this.ngAfterViewInit();
    }, 0);
  }

  select(bookmark: Location): void {
    this.controlsService.file.hide();
    this.dataService.fileChanges.next();
    if (this.eventService.isEditing && this.dataService.isFileModified) {
      this.matDialog.open(ConfirmDialogComponent, {
        data: { message: 'You have unsaved file. Open bookmark?' },
        autoFocus: false,
      }).afterClosed().subscribe(confirm => {
        if (confirm) {
          this.locationService.openNode(bookmark.node);
        }
      });
    } else {
      this.locationService.openNode(bookmark.node);
    }
  }
}
