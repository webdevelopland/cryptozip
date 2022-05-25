import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  HomeComponent,
  CreateComponent,
  BrowserDataModule,
  LoginComponent,
  OpenComponent,
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
    OpenComponent,
    DownloadComponent,
  ],
  imports: [
    BrowserModule,
    CoreModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    BrowserDataModule,
    HttpClientModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
