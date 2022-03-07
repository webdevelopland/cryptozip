import { Component, OnDestroy } from '@angular/core';
import { saveAs } from 'file-saver';
import { Subscription } from 'rxjs';

import { FirebaseService, NotificationService, EventService } from '@/core/services';

@Component({
  selector: 'page-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
})
export class DownloadComponent implements OnDestroy {
  id: string;
  isLoading: boolean = false;
  keySubscription = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private firebaseService: FirebaseService,
    private eventService: EventService,
  ) {
    this.subscribeOnKeydown();
  }

  private subscribeOnKeydown(): void {
    this.keySubscription = this.eventService.keydown.subscribe((event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter': this.download();
      }
    });
  }

  download(): void {
    if (this.id && this.id.trim()) {
      this.isLoading = true;
      this.firebaseService.download(this.id).subscribe(binary => {
        saveAs(new Blob([binary]), this.id + '.czip');
        this.isLoading = false;
      }, () => {
        this.notificationService.warning('Not found');
        this.isLoading = false;
      });
    } else {
      this.notificationService.warning('id is empty');
    }
  }

  ngOnDestroy() {
    this.keySubscription.unsubscribe();
  }
}
