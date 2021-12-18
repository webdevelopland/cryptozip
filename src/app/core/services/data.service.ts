import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { Data, Node, Folder, NodeMap, StringMap } from '@/core/type';

@Injectable()
export class DataService {
  isDecrypted: boolean = false;
  isModified: boolean = false;
  id: string;
  password: string;
  data: Data;
  nodeMap: NodeMap = {};
  pathMap: StringMap = {};
  exitChanges = new Subject<void>();

  constructor(private router: Router) { }

  setData(data: Data): void {
    this.data = data;
    this.sort(this.data.root);
    this.id = data.meta.id;
    this.createPathMap();
    this.isDecrypted = true;
  }

  createPathMap(): void {
    Object.values(this.nodeMap).forEach(node => this.pathMap[node.path] = node.id);
  }

  modify(): void {
    this.sort(this.data.root);
    this.isModified = true;
  }

  update(): void {
    if (this.isModified) {
      this.data.meta.updateVersion++;
      this.data.meta.updatedTimestamp = Date.now();
      this.isModified = false;
    }
  }

  sort(folder: Folder): void {
    folder.nodes.forEach(node => {
      if (node instanceof Folder) {
        this.sort(node);
      }
    });
    folder.nodes.sort((a, b) => {
      // Show folder before files
      const aFolderStatus: number = a.isFolder ? 1 : 0;
      const bFolderStatus: number = b.isFolder ? 1 : 0;
      const folderStatus: number = bFolderStatus - aFolderStatus;
      if (folderStatus !== 0) {
        return folderStatus;
      } else {
        // Sort strings
        return a.name.localeCompare(b.name);
      }
    });
  }

  destroy(): void {
    this.isDecrypted = false;
    this.id = undefined;
    this.password = undefined;
    this.data = undefined;
    this.router.navigate(['/']);
    this.exitChanges.next();
  }
}
