import { NgModule } from '@angular/core';

import { SharedModule } from '@/shared';
import { DataComponent } from './data.component';
import { ContextDialogComponent } from './context-dialog';
import { RenameDialogComponent } from './rename-dialog';
import { MouseService, FileService, GetService } from './services';

@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [
    DataComponent,
    ContextDialogComponent,
    RenameDialogComponent,
  ],
  providers: [MouseService, FileService, GetService],
})
export class DataModule { }
