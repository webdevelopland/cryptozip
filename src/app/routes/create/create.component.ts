import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { DataService } from '@/core/services';

@Component({
  selector: 'page-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent {
  id: string;
  password: string = '';

  constructor(
    private router: Router,
    public dataService: DataService,
  ) {
    this.randomize();
  }

  randomize(): void {
    this.id = this.dataService.generateId();
  }

  create(): void {
    this.dataService.create(this.id, this.password);
  }
}
