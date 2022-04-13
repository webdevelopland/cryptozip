import { Injectable } from '@angular/core';
import { Subscription, debounceTime, Subject } from 'rxjs';

import { Overlay } from '@/core/type';
import { EventService } from '@/core/services';
import { DragService } from './drag.service';

@Injectable()
export class PopupService {
  isPopup: boolean = false;
  overlay: Overlay;
  click = new Subject<void>();
  eventSub = new Subscription();
  addSub = new Subscription();

  constructor(
    private eventService: EventService,
    private dragService: DragService,
  ) { }

  events(): void {
    this.eventSub = this.eventService.click
      .pipe(debounceTime(1))
      .subscribe(point => {
        if (this.overlay) {
          if (this.eventService.boxTest(point, this.overlay)) {
            this.isPopup = false;
          }
        }
        this.dragService.dragEnd();
      });
    this.addSub = this.click
      .pipe(debounceTime(10))
      .subscribe(() => {
        this.isPopup = true;
      });
  }

  add(): void {
    if (!this.isPopup) {
      this.overlay = { point: { x: 0, y: 0 } };
      this.click.next();
    }
  }

  destroy(): void {
    this.isPopup = false;
    this.overlay = undefined;
    this.eventSub.unsubscribe();
    this.addSub.unsubscribe();
  }
}
