import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  HomeComponent,
  CreateComponent,
  BrowserDataModule,
  LoginComponent,
  UploadComponent,
  DownloadComponent,
} from '@/routes';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CreateComponent,
    LoginComponent,
    UploadComponent,
    DownloadComponent,
  ],
  imports: [
    BrowserModule,
    CoreModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    BrowserDataModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
