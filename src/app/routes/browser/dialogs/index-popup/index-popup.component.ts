import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { SearchService, DataService, LocationService } from '@/core/services';
import { ConfirmDialogComponent } from '@/shared/dialogs';
import { ControlsService } from '../../services';

@Component({
  selector: 'index-popup',
  templateUrl: './index-popup.component.html',
  styleUrls: ['./index-popup.component.scss'],
})
export class IndexPopupComponent implements AfterViewInit {
  @ViewChild('popup') popupRef: ElementRef<HTMLDivElement>;

  constructor(
    private matDialog: MatDialog,
    private dataService: DataService,
    private searchService: SearchService,
    private locationService: LocationService,
    private controlsService: ControlsService,
  ) { }

  ngAfterViewInit() {
    this.controlsService.index.overlay = {
      point: {
        x: this.popupRef.nativeElement.offsetLeft,
        y: this.popupRef.nativeElement.offsetTop,
      },
      width: this.popupRef.nativeElement.offsetWidth,
      height: this.popupRef.nativeElement.offsetHeight,
    };
  }

  folder(): void {
    this.askToIndex(false);
    this.controlsService.index.hide();
  }

  children(): void {
    this.askToIndex(true);
    this.controlsService.index.hide();
  }

  askToIndex(global: boolean): void {
    const msg: string = global ? 'Reset index globally?' : 'Reset index locally?';
    this.matDialog.open(ConfirmDialogComponent, {
      data: { message: msg },
      autoFocus: false,
    }).afterClosed().subscribe(res => {
      if (res) {
        if (global) {
          this.locationService.resetIndexGlobally(this.locationService.folder);
        } else {
          this.locationService.resetIndexLocally(this.locationService.folder);
        }
      }
    });
  }
}
