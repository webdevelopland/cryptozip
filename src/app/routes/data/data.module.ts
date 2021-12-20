import { NgModule } from '@angular/core';

import { SharedModule } from '@/shared';
import { DataComponent } from './data.component';
import { ContextDialogComponent, RenameDialogComponent, AddDialogComponent } from './dialogs';
import { MouseService, FileService, GetService, DialogService, BranchService } from './services';

@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [
    DataComponent,
    ContextDialogComponent,
    RenameDialogComponent,
    AddDialogComponent,
  ],
  providers: [MouseService, FileService, GetService, DialogService, BranchService],
})
export class DataModule { }
