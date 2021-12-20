import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  HomeComponent,
  CreateComponent,
  BrowserComponent,
  LoginComponent,
  UploadComponent,
  DownloadComponent,
  TextComponent,
  ImageComponent,
} from '@/routes';
import { DataGuard } from '@/core/services';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'create', component: CreateComponent },
  { path: 'login', component: LoginComponent },
  { path: 'upload', component: UploadComponent },
  { path: 'download', component: DownloadComponent },
  {
    path: '',
    canActivate: [DataGuard],
    children: [
      { path: 'browser', component: BrowserComponent },
      { path: 'browser/text', component: TextComponent },
      { path: 'browser/image', component: ImageComponent },
    ],
  },
  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes),
  ],
  exports: [
    RouterModule,
  ],
})
export class AppRoutingModule { }
