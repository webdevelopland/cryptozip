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
  EncodingService,
  LocationService,
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
    EncodingService,
    LocationService,
  ],
})
export class CoreModule { }
