import { NgModule } from '@angular/core';

import {
  NotificationService,
  DataService,
  DataGuard,
  CryptoService,
  ZipService,
  UrlService,
  MediaService,
  EventService,
  ClipboardService,
  FirebaseService,
  ProtoService,
  TimerService,
  LoadingService,
} from './services';
import { HeaderModule } from './components/header';

@NgModule({
  imports: [
    HeaderModule,
  ],
  exports: [
    HeaderModule,
  ],
  providers: [
    NotificationService,
    DataService,
    DataGuard,
    CryptoService,
    ZipService,
    UrlService,
    MediaService,
    EventService,
    ClipboardService,
    FirebaseService,
    ProtoService,
    TimerService,
    LoadingService,
  ],
})
export class CoreModule { }
