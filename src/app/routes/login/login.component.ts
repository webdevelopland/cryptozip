import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  FirebaseService, ZipService, NotificationService, DataService, EventService
} from '@/core/services';

@Component({
  selector: 'page-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
  id: string;
  password: string;
  isLoading: boolean = false;
  keySubscription = new Subscription();

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private zipService: ZipService,
    private notificationService: NotificationService,
    private dataService: DataService,
    private eventService: EventService,
  ) {
    this.subscribeOnKeydown();
  }

  private subscribeOnKeydown(): void {
    this.keySubscription = this.eventService.keydown.subscribe((event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter': this.login();
      }
    });
  }

  login(): void {
    if (this.id && this.id.trim()) {
      this.isLoading = true;
      this.firebaseService.download(this.id).subscribe(binary => {
        try {
          this.zipService.unpack(binary, this.password);
          this.dataService.password = this.password;
          this.router.navigate(['/browser']);
        } catch (e) {
          this.notificationService.error('Password is incorrect');
          this.isLoading = false;
        }
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
