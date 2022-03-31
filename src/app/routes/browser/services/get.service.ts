import { Injectable } from '@angular/core';
import { randstr64 } from 'rndmjs';

import { Node, Folder, File, NodeMap } from '@/core/type';
import { parseFilename } from '@/core/functions';

@Injectable()
export class GetService {
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
        const fileparse: string[] = parseFilename(newName);
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
          console.warn('Too many copies');
          break;
        }
      }
    }
    return newName;
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
}
