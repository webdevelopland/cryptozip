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
  ProtoService,
  LoadingService,
  NodeService,
  SearchService,
  EncodingService,
  LocationService,
  ServerService,
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
    ProtoService,
    LoadingService,
    NodeService,
    SearchService,
    EncodingService,
    LocationService,
    ServerService,
  ],
})
export class CoreModule { }
