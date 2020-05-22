import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RootComponent, CreateComponent, DataModule } from '@/routes';
import { CoreModule } from './core/core.module';
import { FirebaseModule } from './import';
import { SharedModule } from './shared';

@NgModule({
  declarations: [
    AppComponent,
    RootComponent,
    CreateComponent,
  ],
  imports: [
    BrowserModule,
    CoreModule,
    FirebaseModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    DataModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
