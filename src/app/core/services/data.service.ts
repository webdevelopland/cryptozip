import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { Data, Node, NodeMap, StringMap } from '@/core/type';

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
    this.id = data.meta.id;
    this.createPathMap();
    this.isDecrypted = true;
  }

  createPathMap(): void {
    Object.values(this.nodeMap).forEach(node => this.pathMap[node.path] = node.id);
  }

  update(): void {
    if (this.isModified) {
      this.data.meta.updateVersion++;
      this.data.meta.updatedTimestamp = Date.now();
      this.isModified = false;
    }
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
