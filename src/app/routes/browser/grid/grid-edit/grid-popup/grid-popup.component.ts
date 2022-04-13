import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import { Overlay } from '@/core/type';
import { ClipboardService, DataService } from '@/core/services';

@Component({
  selector: 'grid-popup',
  templateUrl: './grid-popup.component.html',
  styleUrls: ['./grid-popup.component.scss'],
})
export class GridPopupComponent implements AfterViewInit {
  @Input() overlay: Overlay;
  @Output() add = new EventEmitter<string>();
  @ViewChild('popup') popupRef: ElementRef<HTMLDivElement>;

  constructor(
    public clipboardService: ClipboardService,
    private dataService: DataService,
  ) { }

  ngAfterViewInit() {
    this.overlay.point = {
      x: this.popupRef.nativeElement.offsetLeft,
      y: this.popupRef.nativeElement.offsetTop,
    };
    this.overlay.width = this.popupRef.nativeElement.offsetWidth;
    this.overlay.height = this.popupRef.nativeElement.offsetHeight;
  }

  addInput(): void {
    this.add.emit('inputblock');
  }

  addTextarea(): void {
    this.add.emit('textarea');
  }

  addPassword(): void {
    this.add.emit('password');
  }

  addTextblock(): void {
    this.add.emit('textblock');
  }

  addHiddenblock(): void {
    this.add.emit('hiddenblock');
  }
}
