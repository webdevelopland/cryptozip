import { NgModule } from '@angular/core';

import { SharedModule } from '@/shared';
import { HeaderComponent } from './header.component';
import { HeaderService } from './header.service';

@NgModule({
  imports: [
    SharedModule,
  ],
  exports: [HeaderComponent],
  declarations: [
    HeaderComponent,
  ],
  providers: [HeaderService],
})
export class HeaderModule { }
