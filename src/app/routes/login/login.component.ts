import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { FirebaseService, ZipService, NotificationService, DataService } from '@/core/services';

@Component({
  selector: 'page-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  id: string;
  password: string;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private zipService: ZipService,
    private notificationService: NotificationService,
    private dataService: DataService,
  ) { }

  login(): void {
    if (this.id && this.id.trim()) {
      this.isLoading = true;
      this.firebaseService.download(this.id).subscribe(binary => {
        this.zipService.binaryToData(binary, this.password).subscribe(
          data => {
            this.dataService.password = this.password;
            this.dataService.setData(data);
            this.router.navigate(['/browser']);
          },
          () => {
            this.notificationService.error('Password is incorrect');
            this.router.navigate(['/']);
            this.isLoading = false;
          },
        );
      }, () => {
        this.notificationService.warning('Not found');
        this.isLoading = false;
      });
    } else {
      this.notificationService.warning('id is empty');
    }
  }
}
