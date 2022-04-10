import { NgModule } from '@angular/core';

import { SharedModule } from '@/shared';
import { BrowserComponent } from './browser.component';
import { TextComponent } from './text';
import { ImageComponent } from './image';
import { GridModule } from './grid';
import { SearchComponent } from './search';
import {
  RenameDialogComponent,
  TagDialogComponent,
  IndexDialogComponent,
  ControlsPopupComponent,
  AddPopupComponent,
  ContextPopupComponent,
} from './dialogs';
import {
  MouseService,
  FileService,
  GetService,
  DialogService,
  BranchService,
  ControlsService,
} from './services';

@NgModule({
  imports: [
    SharedModule,
    GridModule,
  ],
  declarations: [
    BrowserComponent,
    RenameDialogComponent,
    TagDialogComponent,
    IndexDialogComponent,
    ControlsPopupComponent,
    AddPopupComponent,
    ContextPopupComponent,
    TextComponent,
    ImageComponent,
    SearchComponent,
  ],
  providers: [
    MouseService,
    FileService,
    GetService,
    DialogService,
    BranchService,
    ControlsService,
  ],
})
export class BrowserDataModule { }
