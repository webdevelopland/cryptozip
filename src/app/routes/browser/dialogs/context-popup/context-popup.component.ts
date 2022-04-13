import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { DataService, ZipService } from '@/core/services';
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
  ) { }

  ngAfterViewInit() {
    this.controlsService.context.overlay.width = this.popupRef.nativeElement.offsetWidth;
    this.controlsService.context.overlay.height = this.popupRef.nativeElement.offsetHeight;
    setTimeout(() => {
      this.controlsService.calculateContextPosition();
    }, 0);
  }

  copy(): void {
    this.fileService.copy();
    this.controlsService.closeContextMenu();
  }

  cut(): void {
    this.fileService.cut();
    this.controlsService.closeContextMenu();
  }

  delete(): void {
    this.dialogService.askToDelete();
    this.controlsService.closeContextMenu();
  }

  rename(): void {
    this.dialogService.openRenameDialog(this.controlsService.context.node);
    this.controlsService.closeContextMenu();
  }

  transfer(): void {
    this.fileService.transferTo();
    this.controlsService.closeContextMenu();
  }

  link(): void {
    this.fileService.createLink(this.controlsService.context.node);
    this.controlsService.closeContextMenu();
  }

  export(): void {
    const node = this.controlsService.context.node;
    this.zipService.export(node, node.name);
    this.controlsService.closeContextMenu();
  }

  tags(): void {
    this.dialogService.openTagsDialog(this.controlsService.context.node);
    this.controlsService.closeContextMenu();
  }

  index(): void {
    this.dialogService.openIndexDialog(this.controlsService.context.node);
    this.controlsService.closeContextMenu();
  }

  properties(): void {
    this.controlsService.showProperties(this.controlsService.context.node);
    this.controlsService.closeContextMenu();
  }
}
