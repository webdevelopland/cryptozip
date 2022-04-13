import { NgModule } from '@angular/core';

import { SharedModule } from '@/shared';
import { HeaderComponent } from './header.component';
import { HeaderService } from './header.service';
import { SortPopupComponent } from './sort-popup';

@NgModule({
  imports: [
    SharedModule,
  ],
  exports: [HeaderComponent],
  declarations: [
    HeaderComponent,
    SortPopupComponent,
  ],
  providers: [HeaderService],
})
export class HeaderModule { }
