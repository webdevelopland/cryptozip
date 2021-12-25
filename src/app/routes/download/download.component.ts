import { Component } from '@angular/core';
import { saveAs } from 'file-saver';

import { FirebaseService, NotificationService } from '@/core/services';

@Component({
  selector: 'page-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
})
export class DownloadComponent {
  id: string;
  isLoading: boolean = false;

  constructor(
    private notificationService: NotificationService,
    private firebaseService: FirebaseService,
  ) { }

  download(): void {
    if (this.id.trim()) {
      this.isLoading = true;
      this.firebaseService.download(this.id).subscribe(binary => {
        saveAs(new Blob([binary]), this.id + '.czip');
        this.isLoading = false;
      }, () => {
        this.notificationService.warning('Not found');
        this.isLoading = false;
      });
    }
  }
}
