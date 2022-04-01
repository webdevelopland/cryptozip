import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { generateId } from '@/core/functions';
import { DataService, EventService } from '@/core/services';

@Component({
  selector: 'page-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnDestroy {
  id: string;
  password: string = '';
  keySubscription = new Subscription();

  constructor(
    private router: Router,
    public dataService: DataService,
    public eventService: EventService,
  ) {
    this.subscribeOnKeydown();
    this.randomize();
  }

  private subscribeOnKeydown(): void {
    this.keySubscription = this.eventService.keydown.subscribe((event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter': this.create();
      }
    });
  }

  randomize(): void {
    this.id = generateId();
  }

  create(): void {
    this.dataService.create(this.id, this.password);
  }

  ngOnDestroy() {
    this.keySubscription.unsubscribe();
  }
}
