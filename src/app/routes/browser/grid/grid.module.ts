import { NgModule } from '@angular/core';

import { SharedModule } from '@/shared';
import { GridEditComponent, GridPopupComponent } from './grid-edit';
import { GridViewComponent } from './grid-view';
import {
  GridService,
  DragService,
  PopupService,
} from './grid-edit/services';

@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [
    GridEditComponent,
    GridViewComponent,
    GridPopupComponent,
  ],
  providers: [
    GridService,
    DragService,
    PopupService,
  ],
})
export class GridModule { }
