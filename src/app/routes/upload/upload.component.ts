import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { DataService, NotificationService, ZipService, EventService } from '@/core/services';

@Component({
  selector: 'page-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnDestroy {
  fileList: FileList;
  name: string;
  password: string = '';
  isLoading: boolean = false;
  keySubscription = new Subscription();

  constructor(
    private router: Router,
    private dataService: DataService,
    private zipService: ZipService,
    private notificationService: NotificationService,
    private eventService: EventService,
  ) {
    this.subscribeOnKeydown();
  }

  private subscribeOnKeydown(): void {
    this.keySubscription = this.eventService.keydown.subscribe((event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter': this.decrypt();
      }
    });
  }

  setFile(fileList: FileList): void {
    if (fileList && fileList.length > 0) {
      this.fileList = fileList;
      this.name = fileList.item(0).name;
    }
  }

  decrypt(): void {
    if (this.fileList) {
      this.isLoading = true;
      this.zipService.unzip(this.fileList, this.password).subscribe(() => {
        this.dataService.password = this.password;
        this.router.navigate(['/browser']);
      }, () => {
        this.notificationService.error('Password is incorrect');
        this.isLoading = false;
      });
    } else {
      this.notificationService.warning('Select a file first');
    }
  }

  ngOnDestroy() {
    this.keySubscription.unsubscribe();
  }
}
