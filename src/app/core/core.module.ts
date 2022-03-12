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
  NodeService,
  SearchService,
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
    NodeService,
    SearchService,
  ],
})
export class CoreModule { }
