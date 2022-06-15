import { NgModule } from '@angular/core';

import { SharedModule } from '@/shared';
import { FilePopupComponent } from './file-popup.component';

@NgModule({
  imports: [
    SharedModule,
  ],
  exports: [FilePopupComponent],
  declarations: [FilePopupComponent],
})
export class FilePopupModule { }
