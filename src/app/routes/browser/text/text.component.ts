import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { DataService, NotificationService, EventService } from '@/core/services';

@Component({
  selector: 'page-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
})
export class TextComponent implements OnDestroy {
  content: string;
  keySub = new Subscription();

  constructor(
    public router: Router,
    public dataService: DataService,
    private notificationService: NotificationService,
    private eventService: EventService,
  ) {
    if (this.dataService.file) {
      this.content = this.dataService.file.text;
    } else {
      this.close();
    }
    this.keyboardEvents();
  }

  save(): void {
    this.dataService.file.text = this.content;
    this.notificationService.success('Saved');
  }

  close(): void {
    this.router.navigate(['/browser']);
  }

  keyboardEvents(): void {
    this.keySub = this.eventService.keydown.subscribe(event => {
      if (event.code === 'KeyS' && event.ctrlKey) {
        event.preventDefault();
        this.save();
      }
    });
  }

  ngOnDestroy() {
    this.dataService.file = undefined;
    this.keySub.unsubscribe();
  }
}
