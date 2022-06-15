import { NgModule } from '@angular/core';

import { SharedModule } from '@/shared';
import { BrowserComponent } from './browser.component';
import { TextComponent } from './text';
import { ImageComponent } from './image';
import { VideoComponent } from './video';
import { GridModule } from './grid';
import { SearchComponent } from './search';
import {
  RenameDialogComponent,
  TagDialogComponent,
  IndexDialogComponent,
  IndexPopupComponent,
  ControlsPopupComponent,
  FilePopupModule,
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
    FilePopupModule,
  ],
  declarations: [
    BrowserComponent,
    RenameDialogComponent,
    TagDialogComponent,
    IndexDialogComponent,
    IndexPopupComponent,
    ControlsPopupComponent,
    AddPopupComponent,
    ContextPopupComponent,
    TextComponent,
    ImageComponent,
    VideoComponent,
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
