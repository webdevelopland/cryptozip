import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { DataService } from '@/core/services';
import { HeaderService } from '@/core/components/header';
import { ControlsService, DialogService } from '../../services';

@Component({
  selector: 'controls-popup',
  templateUrl: './controls-popup.component.html',
  styleUrls: ['./controls-popup.component.scss'],
})
export class ControlsPopupComponent implements AfterViewInit {
  isSort: boolean = false;
  @ViewChild('popup') popupRef: ElementRef<HTMLDivElement>;

  constructor(
    public controlsService: ControlsService,
    private dialogService: DialogService,
    private dataService: DataService,
    private headerService: HeaderService,
  ) { }

  ngAfterViewInit() {
    this.controlsService.overlayMenu = {
      point: {
        x: this.popupRef.nativeElement.offsetLeft,
        y: this.popupRef.nativeElement.offsetTop,
      },
      width: this.popupRef.nativeElement.offsetWidth,
      height: this.popupRef.nativeElement.offsetHeight,
    };
  }

  sort(): void {
    this.headerService.isSortGlobal = false;
    this.isSort = !this.headerService.isSortPopup;
    if (!this.headerService.isSortPopup) {
      this.headerService.sortClick.next();
    }
  }

  search(): void {
    this.controlsService.isControlsMenu = false;
    this.controlsService.search();
  }

  select(): void {
    this.controlsService.isControlsMenu = false;
    this.dataService.unselectAll();
  }

  index(): void {
    this.controlsService.isControlsMenu = false;
    this.dialogService.askToIndex();
  }
}
