import { Injectable } from '@angular/core';

import { isApple } from '@/core/functions';

@Injectable()
export class EventService {
  isApple: boolean;

  constructor() {
    this.isApple = isApple();
  }
}
