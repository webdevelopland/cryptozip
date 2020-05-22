import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AutosizeModule } from 'ngx-autosize';

import { MaterialModule } from '@/import';

const ExportDeclarations = [];
const ExportModules = [
  RouterModule,
  FormsModule,
  ReactiveFormsModule,
  HttpClientModule,
  CommonModule,
  AutosizeModule,
  MaterialModule,
];

@NgModule({
  imports: ExportModules,
  declarations: ExportDeclarations,
  exports: [
    ...ExportDeclarations,
    ...ExportModules,
  ]
})
export class SharedModule { }
