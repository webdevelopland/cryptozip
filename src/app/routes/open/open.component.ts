import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ZipError } from '@/core/type';
import { DataService, NotificationService, ZipService, EventService } from '@/core/services';

@Component({
  selector: 'page-open',
  templateUrl: './open.component.html',
  styleUrls: ['./open.component.scss'],
})
export class OpenComponent implements OnDestroy {
  fileList: FileList;
  name: string;
  password: string = '';
  isLoading: boolean = false;
  keySub = new Subscription();

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
    this.keySub = this.eventService.keydown.subscribe((event: KeyboardEvent) => {
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
      }, error => {
        switch (error) {
          case ZipError.WRONG_PASS:
            this.notificationService.error('Password is incorrect');
            break;
          case ZipError.FILE_READER:
            this.notificationService.error('File is too big');
            break;
          default:
            this.notificationService.error('Error');
        }
        this.isLoading = false;
      });
    } else {
      this.notificationService.warning('Select a file first');
    }
  }

  ngOnDestroy() {
    this.keySub.unsubscribe();
  }
}
