import { NgModule } from '@angular/core';

import {
  NotificationService,
  DataService,
  DataGuard,
  CryptoService,
  ZipService,
  UrlService,
  MediaService,
  TmpService,
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
    TmpService,
  ],
})
export class CoreModule { }
