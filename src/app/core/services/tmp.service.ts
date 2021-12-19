import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { Folder, File, Data } from '@/core/type';
import { DataService } from './data.service';
import { ZipService } from './zip.service';
import { META } from '@/environments/meta';

@Injectable()
export class TmpService {
  constructor(
    private dataService: DataService,
    private zipService: ZipService,
  ) {
    /* TEMP */
    this.randomize();
    this.create('asd');
  }

  randomize(): void {
    this.dataService.id = this.zipService.generateId();
  }

  create(password: string): void {
    this.dataService.id = this.dataService.id;
    this.dataService.password = password;
    this.dataService.setData(this.getNewData(this.dataService.id));
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
      updateVersion: 1,
      createdTimestamp: now,
      updatedTimestamp: now,
    };

    return data;
  }
}
