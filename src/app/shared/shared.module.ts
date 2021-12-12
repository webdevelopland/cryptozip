import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AutosizeModule } from 'ngx-autosize';

import { MaterialModule } from '@/import';
import { InfoDialogComponent, ConfirmDialogComponent } from './dialogs';
import { HtmlDirective } from './directives';

const ExportDeclarations = [
  ConfirmDialogComponent,
  InfoDialogComponent,
  HtmlDirective,
];
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
  ],
  entryComponents: [
    ConfirmDialogComponent,
    InfoDialogComponent,
  ],
})
export class SharedModule { }
