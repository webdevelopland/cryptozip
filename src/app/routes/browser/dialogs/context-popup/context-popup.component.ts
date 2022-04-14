import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { DataService, ZipService, LocationService } from '@/core/services';
import { ControlsService, DialogService, FileService } from '../../services';

@Component({
  selector: 'context-popup',
  templateUrl: './context-popup.component.html',
  styleUrls: ['./context-popup.component.scss'],
})
export class ContextPopupComponent implements AfterViewInit {
  @ViewChild('popup') popupRef: ElementRef<HTMLDivElement>;

  constructor(
    public controlsService: ControlsService,
    private dialogService: DialogService,
    private dataService: DataService,
    private fileService: FileService,
    private zipService: ZipService,
    private locationService: LocationService,
  ) { }

  ngAfterViewInit() {
    this.controlsService.context.overlay.width = this.popupRef.nativeElement.offsetWidth;
    this.controlsService.context.overlay.height = this.popupRef.nativeElement.offsetHeight;
    setTimeout(() => {
      this.controlsService.calculateContextPosition();
    }, 0);
  }

  open(): void {
    const node = this.controlsService.context.node;
    this.dataService.unselectAll();
    this.locationService.openNode(node);
    this.controlsService.context.hide();
  }

  copy(): void {
    this.fileService.copy();
    this.controlsService.context.hide();
  }

  cut(): void {
    this.fileService.cut();
    this.controlsService.context.hide();
  }

  delete(): void {
    this.dialogService.askToDelete();
    this.controlsService.context.hide();
  }

  rename(): void {
    this.dialogService.openRenameDialog(this.controlsService.context.node);
    this.controlsService.context.hide();
  }

  transfer(): void {
    this.fileService.transferTo();
    this.controlsService.context.hide();
  }

  link(): void {
    this.fileService.createLink(this.controlsService.context.node);
    this.controlsService.context.hide();
  }

  export(): void {
    const node = this.controlsService.context.node;
    this.zipService.export(node, node.name);
    this.controlsService.context.hide();
  }

  tags(): void {
    this.dialogService.openTagsDialog(this.controlsService.context.node);
    this.controlsService.context.hide();
  }

  index(): void {
    this.dialogService.openIndexDialog(this.controlsService.context.node);
    this.controlsService.context.hide();
  }

  properties(): void {
    this.controlsService.showProperties(this.controlsService.context.node);
    this.controlsService.context.hide();
  }
}
