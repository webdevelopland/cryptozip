import { Component } from '@angular/core';
import { Subscription } from 'rxjs';

import { File } from '@/core/type';
import { DataService, ZipService } from '@/core/services';
import { HeaderService } from '@/core/components/header';

@Component({
  selector: 'page-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
})
export class DataComponent {
  subs: Subscription[] = [];

  constructor(
    private dataService: DataService,
    private headerService: HeaderService,
    private zipService: ZipService,
  ) {
    console.log(this.dataService.data);
    this.sub(this.headerService.editChanges.subscribe(() => {
      // Meta editing. Archive id, password, etc
      this.mockEdit();
    }));
    this.sub(this.headerService.downloadChanges.subscribe(() => {
      this.dataService.update();
      this.zipService.zip(this.dataService.data, this.dataService.password);
    }));
    this.sub(this.headerService.deleteChanges.subscribe(() => {
      console.log('delete');
    }));
    this.sub(this.headerService.saveChanges.subscribe(() => {
      this.dataService.update();
      console.log(this.dataService.data);
    }));
  }

  mockEdit(): void {
    const file = this.dataService.data.root.nodes[1] as File;
    if (file.name === 'hello.txt') {
      file.text = 'New string';
    } else {
      throw new Error('Wrong node');
    }
  }

  sub(sub: Subscription): void {
    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
