import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { isApple } from '@/core/functions';

@Injectable()
export class EventService {
  isApple: boolean;
  keydown = new Subject<KeyboardEvent>();

  constructor() {
    this.isApple = isApple();
    document.addEventListener('keydown', event => {
      this.keydown.next(event);
    }, false);
  }
}
