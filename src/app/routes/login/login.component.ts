import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  ZipService, NotificationService, DataService, EventService, ServerService
} from '@/core/services';

@Component({
  selector: 'page-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
  id: string = '';
  password: string = '';
  isLoading: boolean = false;
  keySubscription = new Subscription();

  constructor(
    private router: Router,
    private zipService: ZipService,
    private notificationService: NotificationService,
    private dataService: DataService,
    private eventService: EventService,
    private serverService: ServerService,
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
      this.serverService.load(this.id).subscribe(binary => {
        try {
          this.zipService.decrypt(binary, this.password);
          this.dataService.password = this.password;
          this.router.navigate(['/browser']);
        } catch (e) {
          if (e.message === 'Invalid password') {
            this.notificationService.error('Password is incorrect');
          } else {
            this.notificationService.error('Error');
          }
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
