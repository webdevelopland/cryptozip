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

  constructor(
    private router: Router,
    private dataService: DataService,
    private zipService: ZipService,
    private notificationService: NotificationService,
  ) { }

  decrypt(fileList: FileList): void {
    this.zipService.unzip(fileList, this.password).subscribe(data => {
      this.dataService.password = this.password;
      this.dataService.data = data;
      this.dataService.id = data.meta.id;
      this.dataService.isDecrypted = true;
      this.router.navigate(['/data']);
    }, () => {
      this.notificationService.error('Password is incorrect');
      this.router.navigate(['/']);
    });
  }
}
