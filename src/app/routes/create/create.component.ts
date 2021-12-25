import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Data } from '@/core/type';
import { ZipService, DataService } from '@/core/services';
import { META } from '@/environments/meta';

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
    private zipService: ZipService,
    public dataService: DataService,
  ) {
    this.randomize();
  }

  randomize(): void {
    this.id = this.zipService.generateId();
  }
  
  create(): void {
    this.dataService.id = this.id;
    this.dataService.password = this.password;
    this.dataService.setData(this.getNewData(this.dataService.id));
    this.router.navigate(['/browser']);
  }

  getNewData(id: string): Data {
    const root = '/' + id;

    const data = new Data();
    data.root = this.zipService.getFolder(root);

    const now: number = Date.now();
    data.meta = {
      id: id,
      encryptorVersion: META.version,
      updateVersion: 1,
      createdTimestamp: now,
      updatedTimestamp: now,
    };

    return data;
  }
}
