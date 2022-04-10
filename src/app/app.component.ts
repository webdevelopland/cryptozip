import { Component, Renderer2 } from '@angular/core';

import { EventService } from '@/core/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(
    private eventService: EventService,
    private renderer2: Renderer2,
  ) {
    if (this.eventService.isApple) {
      this.renderer2.addClass(document.body, 'apple');
    }
  }
}
