import { Component } from '@angular/core';

import { EventService } from '@/core/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(
    private eventService: EventService,
  ) { }
}
