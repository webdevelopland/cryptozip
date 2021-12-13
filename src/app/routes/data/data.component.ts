import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { randstr } from 'rndmjs';

import { Node, File, Folder, Parse } from '@/core/type';
import { DataService, ZipService } from '@/core/services';
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

  constructor(
    public dataService: DataService,
    private headerService: HeaderService,
    private zipService: ZipService,
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
    this.unselectAll();
    node.isSelected = true;
  }

  dblclick(node: Node): void {
    if (node instanceof Folder) {
      this.unselectAll();
      this.folder = node;
    }
  }

  addFile(): void {
    const name: string = randstr(12);
    const file: File = this.zipService.getFile(this.folder.path + '/' + name + '.txt');
    file.text = '';
    this.folder.push(file);
    this.dataService.nodeMap[file.id] = file;
    this.dataService.pathMap[file.path] = file.id;
    this.dataService.isModified = true;
  }

  addFolder(): void {
    const name: string = randstr(12);
    const folder: Folder = this.zipService.getFolder(this.folder.path + '/' + name);
    this.folder.push(folder);
    this.dataService.nodeMap[folder.id] = folder;
    this.dataService.pathMap[folder.path] = folder.id;
    this.dataService.isModified = true;
  }

  sub(sub: Subscription): void {
    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
