import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Folder, File, Data } from '@/core/type';
import { DataService, ZipService } from '@/core/services';
import { META } from '@/environments/meta';

@Component({
  selector: 'page-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent {
  id: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private dataService: DataService,
    private zipService: ZipService,
  ) {
    this.randomize();
  }

  randomize(): void {
    this.id = this.zipService.generateId();
  }

  create(): void {
    this.dataService.id = this.id;
    this.dataService.password = this.password;
    this.dataService.data = this.getNewData(this.id);
    this.dataService.isDecrypted = true;
    this.router.navigate(['/data']);
  }

  getNewData(id: string): Data {
    const root = '/' + id;

    const data = new Data();
    data.root = this.zipService.getFolder(root);

    const hello: File = this.zipService.getFile(root + '/hello.txt');
    hello.text = 'Hello czip';
    data.root.push(hello);

    const service: Folder = this.zipService.getFolder(root + '/service');
    data.root.push(service);

    const run: File = this.zipService.getFile(service.path + '/run.js');
    run.text = 'print("Run")';
    service.push(run);

    const now: number = Date.now();
    data.meta = {
      id: id,
      encryptorVersion: META.version,
      updateVersion: 0,
      createdTimestamp: now,
      updatedTimestamp: now,
    };

    return data;
  }
}
