import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RootComponent, CreateComponent, DataComponent } from '@/routes';
import { DataGuard } from '@/core/services';

const appRoutes: Routes = [
  { path: '', component: RootComponent },
  { path: 'create', component: CreateComponent },
  {
    path: '',
    canActivate: [DataGuard],
    children: [
      { path: 'data', component: DataComponent },
    ],
  },
  { path: '**', component: RootComponent },
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
