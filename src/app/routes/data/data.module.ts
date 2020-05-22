import { NgModule } from '@angular/core';

import { SharedModule } from '@/shared';
import { DataComponent } from './data.component';

@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [
    DataComponent,
  ],
})
export class DataModule { }
