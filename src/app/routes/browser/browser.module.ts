import { NgModule } from '@angular/core';

import { SharedModule } from '@/shared';
import { BrowserComponent } from './browser.component';
import { TextComponent } from './text';
import { ImageComponent } from './image';
import { GridViewComponent, GridEditComponent } from './grid';
import {
  ContextDialogComponent, RenameDialogComponent, AddDialogComponent, GridDialogComponent
} from './dialogs';
import { MouseService, FileService, GetService, DialogService, BranchService } from './services';

@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [
    BrowserComponent,
    ContextDialogComponent,
    RenameDialogComponent,
    AddDialogComponent,
    GridDialogComponent,
    TextComponent,
    ImageComponent,
    GridViewComponent, GridEditComponent,
  ],
  providers: [MouseService, FileService, GetService, DialogService, BranchService],
})
export class BrowserDataModule { }
