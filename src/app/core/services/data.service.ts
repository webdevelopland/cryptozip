import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { randCustomString, numerals } from 'rndmjs';

import { Data, Node, File, Folder, NodeMap, StringMap, Parse } from '@/core/type';
import { parsePath } from '@/core/functions';
import { META } from '@/environments/meta';
import { LoadingService } from './loading.service';

@Injectable()
export class DataService {
  isDecrypted: boolean = false;
  isModified: boolean = false;
  id: string;
  password: string;
  data: Data;
  folder: Folder; // Current folder (open in browser)
  file: File; // Current file (open in editor)
  nodeMap: NodeMap = {};
  pathMap: StringMap = {};

  constructor(
    private router: Router,
    private loadingService: LoadingService,
  ) { }

  setData(data: Data): void {
    this.data = data;
    this.folder = data.root;
    this.nodeMap = {};
    this.pathMap = {};
    this.refresh(this.data.root);
    this.id = data.meta.id;
    this.isDecrypted = true;
  }

  modify(): void {
    this.nodeMap = {};
    this.pathMap = {};
    this.refresh(this.data.root);
    this.isModified = true;
  }

  update(): void {
    if (this.isModified) {
      this.data.meta.updateVersion++;
      this.data.meta.updatedTimestamp = Date.now();
      this.isModified = false;
    }
  }

  refresh(folder: Folder): void {
    this.nodeMap[folder.id] = folder;
    this.pathMap[folder.path] = folder.id;
    folder.nodes.forEach(node => {
      this.nodeMap[node.id] = node;
      this.pathMap[node.path] = node.id;
      if (node instanceof Folder) {
        this.refresh(node);
      }
    });
    this.sort(folder.nodes);
  }

  sort(nodes: Node[]): void {
    nodes.sort((a, b) => {
      // Show parents before children
      const aNodeLength: number = parsePath(a.path).length;
      const bNodeLength: number = parsePath(b.path).length;
      const lengthStatus: number = aNodeLength - bNodeLength;
      // Show folder before files
      const aFolderStatus: number = a.isFolder ? 1 : 0;
      const bFolderStatus: number = b.isFolder ? 1 : 0;
      const folderStatus: number = bFolderStatus - aFolderStatus;
      if (lengthStatus !== 0) {
        return lengthStatus;
      } else if (folderStatus !== 0) {
        return folderStatus;
      } else {
        // Sort strings
        return a.name.localeCompare(b.name);
      }
    });
  }

  generateId(): string {
    return randCustomString(numerals, 9);
  }

  create(id: string, password: string): void {
    this.id = id;
    this.password = password;
    this.setData(this.getNewData(this.id));
    this.router.navigate(['/browser']);
  }

  private getNewData(id: string): Data {
    const root = '/' + id;

    const data = new Data();
    data.root = this.getFolder(root);
    data.root.path = '/';

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

  getFile(path: string, id?: string): File {
    const file = new File();
    if (id) {
      file.id = id;
    }
    file.path = path;
    const parse: Parse = parsePath(path);
    file.name = parse.name;
    return file;
  }

  getFolder(path: string, id?: string): Folder {
    const folder = new Folder();
    if (id) {
      folder.id = id;
    }
    folder.path = path;
    const parse: Parse = parsePath(path);
    folder.name = parse.name;
    return folder;
  }

  destroy(): void {
    this.isDecrypted = false;
    this.id = undefined;
    this.password = undefined;
    this.data = undefined;
    this.folder = undefined;
    this.loadingService.loads = 0;
  }
}
