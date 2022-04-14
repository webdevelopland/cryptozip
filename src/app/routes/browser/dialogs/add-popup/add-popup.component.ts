import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { ClipboardService, DataService } from '@/core/services';
import { ControlsService, DialogService, FileService } from '../../services';

@Component({
  selector: 'add-popup',
  templateUrl: './add-popup.component.html',
  styleUrls: ['./add-popup.component.scss'],
})
export class AddPopupComponent implements AfterViewInit {
  @ViewChild('popup') popupRef: ElementRef<HTMLDivElement>;

  constructor(
    public clipboardService: ClipboardService,
    public controlsService: ControlsService,
    private dialogService: DialogService,
    private dataService: DataService,
    private fileService: FileService,
  ) { }

  ngAfterViewInit() {
    this.controlsService.add.overlay = {
      point: {
        x: this.popupRef.nativeElement.offsetLeft,
        y: this.popupRef.nativeElement.offsetTop,
      },
      width: this.popupRef.nativeElement.offsetWidth,
      height: this.popupRef.nativeElement.offsetHeight,
    };
  }

  addFile(): void {
    this.controlsService.add.hide();
    this.fileService.addTxtFile();
  }

  addFolder(): void {
    this.controlsService.add.hide();
    this.fileService.addFolder();
  }

  addGrid(): void {
    this.controlsService.add.hide();
    this.fileService.addGrid();
  }

  importFile(fileList: FileList): void {
    this.controlsService.add.hide();
    this.fileService.importFiles(fileList);
  }

  importFolder(fileList: FileList): void {
    this.controlsService.add.hide();
    this.fileService.importFolder(fileList);
  }

  transfer(): void {
    this.controlsService.add.hide();
    this.fileService.readClipboard();
  }

  paste(): void {
    this.controlsService.add.hide();
    this.fileService.paste();
  }
}
