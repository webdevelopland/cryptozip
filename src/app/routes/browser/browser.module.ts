import { NgModule } from '@angular/core';

import { SharedModule } from '@/shared';
import { BrowserComponent } from './browser.component';
import { TextComponent } from './text';
import { ImageComponent } from './image';
import {
  ContextDialogComponent, RenameDialogComponent, AddDialogComponent, PasswordDialogComponent,
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
    PasswordDialogComponent,
    TextComponent,
    ImageComponent,
  ],
  providers: [MouseService, FileService, GetService, DialogService, BranchService],
})
export class BrowserDataModule { }
