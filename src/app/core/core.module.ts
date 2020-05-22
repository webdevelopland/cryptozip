import { NgModule } from '@angular/core';

import {
  NotificationService,
  DataService,
  DataGuard,
} from './services';

@NgModule({
  providers: [
    NotificationService,
    DataService,
    DataGuard,
  ],
})
export class CoreModule { }
