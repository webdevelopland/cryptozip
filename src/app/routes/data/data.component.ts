import { Component, OnDestroy } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { randstr } from 'rndmjs';

import { Node, File, Folder, Parse } from '@/core/type';
import { DataService, ZipService, NotificationService, EventService } from '@/core/services';
import { parsePath } from '@/core/functions';
import { HeaderService } from '@/core/components/header';

@Component({
  selector: 'page-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
})
export class DataComponent implements OnDestroy {
  folder: Folder;
  subs: Subscription[] = [];
  touchSub = new Subscription();

  constructor(
    public dataService: DataService,
    private headerService: HeaderService,
    private zipService: ZipService,
    private notificationService: NotificationService,
    private eventService: EventService,
  ) {
    this.folder = this.dataService.data.root;
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
    const parentPath: string = parsePath(this.folder.path).parent;
    if (parentPath !== '/') {
      const parentId: string = this.dataService.pathMap[parentPath];
      const parent = this.dataService.nodeMap[parentId] as Folder;
      this.unselectAll();
      this.folder = parent;
    }
  }

  unselectAll(): void {
    Object.values(this.dataService.nodeMap).forEach(node => node.isSelected = false);
  }

  click(node: Node): void {
    if (node instanceof Folder) {
      this.unselectAll();
      this.folder = node;
    }
  }

  dblclick(node: Node): void {
    // this.unselectAll();
    // node.isSelected = true;
  }

  contextmenu(event: MouseEvent, node: Node): void {
    event.preventDefault();
    this.openContextmenu(node);
  }

  touchstart(node: Node): void {
    if (this.eventService.isApple) {
      this.touchSub.unsubscribe();
      this.touchSub = timer(500).subscribe(() => {
        this.openContextmenu(node);
      });
    }
  }

  touchend(): void {
    this.touchSub.unsubscribe();
  }

  openContextmenu(node: Node): void {
    this.unselectAll();
    node.isSelected = true;
  }

  addFile(): void {
    const name: string = randstr(12);
    const file: File = this.zipService.getFile(this.folder.path + '/' + name + '.txt');
    file.text = '';
    this.folder.push(file);
    this.dataService.nodeMap[file.id] = file;
    this.dataService.pathMap[file.path] = file.id;
    this.dataService.modify();
  }

  addFolder(): void {
    const name: string = randstr(12);
    const folder: Folder = this.zipService.getFolder(this.folder.path + '/' + name);
    this.folder.push(folder);
    this.dataService.nodeMap[folder.id] = folder;
    this.dataService.pathMap[folder.path] = folder.id;
    this.dataService.modify();
  }

  sub(sub: Subscription): void {
    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.touchSub.unsubscribe();
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
