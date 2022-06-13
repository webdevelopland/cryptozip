import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  HomeComponent,
  CreateComponent,
  BrowserComponent,
  LoginComponent,
  OpenComponent,
  DownloadComponent,
  TextComponent,
  ImageComponent,
  VideoComponent,
  GridViewComponent, GridEditComponent,
  SearchComponent,
} from '@/routes';
import { DataGuard } from '@/core/services';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'create', component: CreateComponent },
  { path: 'login', component: LoginComponent },
  { path: 'open', component: OpenComponent },
  { path: 'download', component: DownloadComponent },
  {
    path: '',
    canActivate: [DataGuard],
    children: [
      { path: 'browser', component: BrowserComponent },
      { path: 'browser/text', component: TextComponent },
      { path: 'browser/image', component: ImageComponent },
      { path: 'browser/video', component: VideoComponent },
      { path: 'browser/grid', component: GridViewComponent },
      { path: 'browser/grid-edit', component: GridEditComponent },
      { path: 'browser/search', component: SearchComponent },
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
