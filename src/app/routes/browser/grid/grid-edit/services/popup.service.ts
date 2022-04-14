import { Injectable } from '@angular/core';
import { Subscription, debounceTime } from 'rxjs';

import { Popup } from '@/core/type';
import { EventService } from '@/core/services';
import { DragService } from './drag.service';

@Injectable()
export class PopupService {
  popup = new Popup();
  eventSub = new Subscription();

  constructor(
    private eventService: EventService,
    private dragService: DragService,
  ) { }

  events(): void {
    this.eventSub = this.eventService.click
      .pipe(debounceTime(1))
      .subscribe(point => {
        this.popup.boxTest(point);
        this.dragService.dragEnd();
      });
    this.popup.subscribe();
  }

  destroy(): void {
    this.popup.destroy();
    this.eventSub.unsubscribe();
  }
}
