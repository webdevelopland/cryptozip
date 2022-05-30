import { Component, OnDestroy } from '@angular/core';
import { saveAs } from 'file-saver';
import { Subscription } from 'rxjs';

import { NotificationService, EventService, ServerService } from '@/core/services';

@Component({
  selector: 'page-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
})
export class DownloadComponent implements OnDestroy {
  id: string;
  isLoading: boolean = false;
  keySub = new Subscription();
  loadSub = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private eventService: EventService,
    private serverService: ServerService,
  ) {
    this.subscribeOnKeydown();
  }

  private subscribeOnKeydown(): void {
    this.keySub = this.eventService.keydown.subscribe((event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter': this.download();
      }
    });
  }

  download(): void {
    if (this.id && this.id.trim()) {
      this.isLoading = true;
      this.loadSub = this.serverService.load(this.id).subscribe(binary => {
        saveAs(new Blob([binary]), this.id + '.czip');
        this.isLoading = false;
      }, () => {
        this.notificationService.warning('Not found');
        this.isLoading = false;
      });
    } else {
      this.notificationService.warning('Empty id is invalid');
    }
  }

  ngOnDestroy() {
    this.keySub.unsubscribe();
    this.loadSub.unsubscribe();
  }
}
