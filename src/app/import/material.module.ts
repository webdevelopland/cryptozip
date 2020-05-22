import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';

const MaterialImports = [
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatInputModule,
  MatDialogModule,
];

@NgModule({
  imports: MaterialImports,
  exports: MaterialImports,
})
export class MaterialModule { }
