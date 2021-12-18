import { Component } from '@angular/core';

import { TmpService, EventService } from '@/core/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(
    private tmpService: TmpService,
    private eventService: EventService,
  ) { }
}
