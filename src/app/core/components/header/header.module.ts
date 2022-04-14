import { NgModule } from '@angular/core';

import { SharedModule } from '@/shared';
import { HeaderComponent } from './header.component';
import { HeaderService } from './header.service';
import { SortPopupComponent } from './sort-popup';
import { MenuPopupComponent } from './menu-popup';

@NgModule({
  imports: [
    SharedModule,
  ],
  exports: [HeaderComponent],
  declarations: [
    HeaderComponent,
    SortPopupComponent,
    MenuPopupComponent,
  ],
  providers: [HeaderService],
})
export class HeaderModule { }
