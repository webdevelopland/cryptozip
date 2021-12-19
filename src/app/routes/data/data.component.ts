import { Component, OnDestroy } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { randstr } from 'rndmjs';

import { Node, File, Folder, Parse } from '@/core/type';
import { DataService, ZipService, NotificationService, EventService } from '@/core/services';
import { parsePath } from '@/core/functions';
import { HeaderService } from '@/core/components/header';
import { MouseService, FileService, GetService } from './services';

@Component({
  selector: 'page-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
})
export class DataComponent implements OnDestroy {
  subs: Subscription[] = [];

  constructor(
    public dataService: DataService,
    private headerService: HeaderService,
    private zipService: ZipService,
    private notificationService: NotificationService,
    private eventService: EventService,

    public mouseService: MouseService,
    public fileService: FileService,
    public getService: GetService,
  ) {
    this.sub(this.headerService.editChanges.subscribe(() => {
      // Meta editing. Archive id, password, etc
      console.log('edit');
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

  back(): void {
    const parentPath: string = parsePath(this.dataService.folder.path).parent;
    if (parentPath !== '/') {
      const parentId: string = this.dataService.pathMap[parentPath];
      const parent = this.dataService.nodeMap[parentId] as Folder;
      this.getService.unselectAll();
      if (!parent) {
        this.notificationService.crash(parentPath + ': parent not found');
      }
      this.dataService.folder = parent;
    }
  }

  sub(sub: Subscription): void {
    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
    this.mouseService.destroy();
  }
}
