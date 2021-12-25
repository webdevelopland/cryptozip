import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { DataService, NotificationService, ZipService } from '@/core/services';

@Component({
  selector: 'page-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent {
  password: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private dataService: DataService,
    private zipService: ZipService,
    private notificationService: NotificationService,
  ) { }

  decrypt(fileList: FileList): void {
    this.isLoading = true;
    this.zipService.unzip(fileList, this.password).subscribe(data => {
      this.dataService.password = this.password;
      this.dataService.setData(data);
      this.router.navigate(['/browser']);
    }, () => {
      this.notificationService.error('Password is incorrect');
      this.router.navigate(['/']);
      this.isLoading = false;
    });
  }
}
