import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { TmpService, DataService } from '@/core/services';

@Component({
  selector: 'page-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent {
  password: string = '';

  constructor(
    private router: Router,
    private tmpService: TmpService,
    public dataService: DataService,
  ) {
    this.tmpService.randomize();
  }

  randomize(): void {
    this.tmpService.randomize();
  }

  create(): void {
    this.tmpService.create(this.password);
    this.router.navigate(['/browser']);
  }
}
