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
import { HeaderService } from '../header.service';

@Component({
  selector: 'menu-popup',
  templateUrl: './menu-popup.component.html',
  styleUrls: ['./menu-popup.component.scss'],
})
export class MenuPopupComponent implements AfterViewInit {
  @Input() overlay: Overlay;
  @Output() openMenu = new EventEmitter<string>();
  @ViewChild('popup') popupRef: ElementRef<HTMLDivElement>;

  constructor(
    public headerService: HeaderService,
  ) { }

  ngAfterViewInit() {
    this.overlay.point = {
      x: this.popupRef.nativeElement.offsetLeft,
      y: this.popupRef.nativeElement.offsetTop,
    };
    this.overlay.width = this.popupRef.nativeElement.offsetWidth;
    this.overlay.height = this.popupRef.nativeElement.offsetHeight;
  }

  click(functionName): void {
    this.openMenu.emit(functionName);
  }
}
