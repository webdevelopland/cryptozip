import { Injectable } from '@angular/core';
import { randstr64 } from 'rndmjs';

import { NotificationService, DataService, ZipService } from '@/core/services';
import { Node, Folder, File, NodeMap } from '@/core/type';

@Injectable()
export class GetService {
  constructor(
    private notificationService: NotificationService,
    private dataService: DataService,
    private zipService: ZipService,
  ) { }

  // Checks that node with the name is present in node list
  checkNodeAlreadyExists(name: string, nodes: Node[]): boolean {
    for (const node of nodes) {
      if (node.name.toLowerCase() === name.toLowerCase()) {
        return true;
      }
    }
    return false;
  }

  // Converts myfile.txt to myfile_2.txt (if taken)
  getNewName(node: Node, nodes: Node[]): string {
    let newName: string = node.name;
    if (this.checkNodeAlreadyExists(newName, nodes)) {
      let filename: string;
      let ext: string;
      if (node.isFolder) {
        // myfolder
        filename = newName;
        ext = '';
      } else {
        // code.js.map -> [code, js.map]
        const fileparse: string[] = this.parseFilename(newName);
        filename = fileparse[0];
        ext = '.' + fileparse[1];
      }

      for (let i = 0; i <= 100; i++) {
        // file_20 -> file_21
        const regExp: RegExpMatchArray = filename.match(/.+?_([0-9]+)/);
        if (regExp && regExp[1]) {
          // file_20 -> file
          filename = filename.substr(0, filename.length - ('_' + regExp[1]).length);
          // file -> file_21
          const newNumber: number = parseInt(regExp[1]) + 1;
          filename = filename + '_' + newNumber;
        } else {
          filename = filename + '_' + 2; // Default value
        }
        newName = filename + ext;
        if (!this.checkNodeAlreadyExists(newName, nodes)) {
          break;
        }
        if (i === 100) {
          // 100 copies are too much, don't you think?
          // Let's just add random seed
          filename += randstr64(20);
          newName = filename + ext;
          this.notificationService.warning('Too many copies');
          break;
        }
      }
    }
    return newName;
  }

  // code.js.map -> [code, js.map]
  parseFilename(filename: string): string[] {
    const name: string = filename.split('.').reverse().pop();
    const ext: string = filename.substr(name.length + 1, filename.length - 1);
    return [name, ext];
  }

  isCutBlock(thisFolder: Folder, nodes: Node[]): boolean {
    for (const node of nodes) {
      if (thisFolder.path.startsWith(node.path + '/') || thisFolder.path === node.path) {
        return true;
      }
    }
    return false;
  }

  getNewNameMap(thisFolder: Folder, copiedNodes: Node[]): NodeMap {
    const newNameMap: NodeMap = {};
    for (const node of copiedNodes) {
      const newFolderNodes: Node[] = [];
      newFolderNodes.push(...thisFolder.nodes, ...Object.values(newNameMap));
      const newName: string = this.getNewName(node, newFolderNodes);
      if (node.isFolder) {
        const folder = new Folder();
        folder.name = newName;
        newNameMap[node.id] = folder;
      } else {
        const file = new File();
        file.name = newName;
        newNameMap[node.id] = file;
      }
    }
    return newNameMap;
  }

  unselectAll(): void {
    Object.values(this.dataService.nodeMap).forEach(node => node.isSelected = false);
  }

  copyFolderNodes(originFolder: Folder, path: string): Node[] {
    const children: Node[] = [];
    originFolder.nodes.forEach(node => {
      const newPath: string = path + '/' + node.name;
      if (node instanceof Folder) {
        const folder: Folder = this.zipService.getFolder(newPath);
        folder.nodes = this.copyFolderNodes(node, newPath);
        children.push(folder);
      } else if (node instanceof File) {
        const file: File = this.zipService.getFile(newPath);
        file.isBinary = node.isBinary;
        if (file.isBinary) {
          file.binary = node.binary;
        } else {
          file.text = node.text;
        }
        children.push(file);
      }
    });
    return children;
  }

  renameAllChildren(folder: Folder): void {
    folder.nodes.forEach(node => {
      node.path = folder.path + '/' + node.name;
      this.dataService.pathMap[node.path] = node.id;
      if (node instanceof Folder) {
        this.renameAllChildren(node);
      }
    });
  }
}
