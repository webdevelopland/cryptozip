import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { generateId } from '@/core/functions';
import { DataService, EventService, NotificationService } from '@/core/services';

@Component({
  selector: 'page-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnDestroy {
  id: string;
  password: string = '';
  keySub = new Subscription();

  constructor(
    private router: Router,
    public dataService: DataService,
    public eventService: EventService,
    private notificationService: NotificationService,
  ) {
    this.subscribeOnKeydown();
    this.randomize();
  }

  private subscribeOnKeydown(): void {
    this.keySub = this.eventService.keydown.subscribe((event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter': this.create();
      }
    });
  }

  randomize(): void {
    this.id = generateId();
  }

  create(): void {
    if (this.id && this.id.trim()) {
      this.dataService.create(this.id, this.password);
    } else {
      this.notificationService.warning('Empty id is invalid');
    }
  }

  ngOnDestroy() {
    this.keySub.unsubscribe();
  }
}
