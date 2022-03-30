import { Injectable } from '@angular/core';
import { Observable, zip } from 'rxjs';

import {
  DataService, ZipService, MediaService, NotificationService, ProtoService
} from '@/core/services';
import { Node, Folder, File, Parse } from '@/core/type';
import { parsePath, Path } from '@/core/functions';
import { GetService } from './get.service';

@Injectable()
export class BranchService {
  constructor(
    private notificationService: NotificationService,
    private dataService: DataService,
    private protoService: ProtoService,
    private zipService: ZipService,
    private mediaService: MediaService,
    private getService: GetService,
  ) { }

  // Creates branch from list and connects it with tree
  connectNodeList(thisFolder: Folder, nodeList: Node[]): void {
    this.sort(nodeList);
    for (const node of nodeList) {
      // Convert list to tree
      this.protoService.addToTree(nodeList, node);
    }
    const localHead: Folder = nodeList[0] as Folder;
    // Add a number, if name is already taken
    localHead.name = this.getService.getNewName(localHead, thisFolder.nodes);
    this.connectBranch(localHead, thisFolder);
  }

  // Updates paths and lengths of all nodes in the branch to match new tree.
  connectBranch(node: Node, parent: Folder): void {
    node.path = Path.join(parent.path, node.name);
    if (node.isFolder) {
      const folder = node as Folder;
      folder.nodes.forEach(child => {
        this.connectBranch(child, folder);
      });
    }
  }

  unselectAll(): void {
    Object.values(this.dataService.nodeMap).forEach(node => node.isSelected = false);
  }

  copyFolderNodes(originFolder: Folder, path: string): Node[] {
    const children: Node[] = [];
    originFolder.nodes.forEach(node => {
      const newPath: string = Path.join(path, node.name);
      if (node instanceof Folder) {
        const folder: Folder = this.dataService.getFolder(newPath);
        folder.nodes = this.copyFolderNodes(node, newPath);
        children.push(folder);
      } else if (node instanceof File) {
        const file: File = this.dataService.getFile(newPath);
        file.isBinary = node.isBinary;
        file.block = node.block;
        if (node.isBinary) {
          file.block.binary = node.block.binary;
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
      node.path = Path.join(folder.path, node.name);
      this.dataService.pathMap[node.path] = node.id;
      if (node instanceof Folder) {
        this.renameAllChildren(node);
      }
    });
  }

  // Converts FileList to File[]
  getListOfFiles(fileList: FileList): Observable<File[]> {
    const observableList: Observable<File>[] = [];
    const sizeLimitFileList: string[] = [];
    for (const bitFile of Array.from(fileList)) {
      // TODO: update, when webkitRelativePath will be standard.
      // https://developer.mozilla.org/en-US/docs/Web/API/File/webkitRelativePath
      const path: string = bitFile['webkitRelativePath'] || '';
      if (bitFile.size > 30000000) {
        sizeLimitFileList.push(path || bitFile.name);
        continue;
      }
      observableList.push(new Observable(observer => {
        const newFile = new File();
        newFile.name = bitFile.name;
        newFile.path = '/' + path;
        const reader = new FileReader();
        switch (this.mediaService.getMediaType(bitFile.name)) {
          case 'text':
            // Text
            reader.readAsText(bitFile, 'UTF-8');
            reader.onload = () => {
              newFile.text = reader.result.toString();
              newFile.isBinary = false;
              observer.next(newFile);
            };
            reader.onerror = () => {
              // Reader error
            };
            break;
          default:
            // Binary
            reader.readAsArrayBuffer(bitFile);
            reader.onload = () => {
              const binary = new Uint8Array(reader.result as ArrayBuffer);
              newFile.block.binary = binary;
              newFile.isBinary = true;
              observer.next(newFile);
            };
        }
      }));
    }
    this.displaySizeLimitFiles(sizeLimitFileList, '30Mb');
    if (observableList.length > 0) {
      return zip(...observableList);
    } else {
      return new Observable(observer => observer.next([]));
    }
  }

  // Shows which files weren't uploaded, because of the size
  private displaySizeLimitFiles(sizeLimitFileList: string[], size: string): void {
    if (sizeLimitFileList.length > 0) {
      let SIZE_LIMIT_MESSAGE: string = `Size of a file can't be more than ${size}.\n`;
      SIZE_LIMIT_MESSAGE += "Files below weren't uploaded because of the limit:\n\n";

      const sizeLimitMessage: string = SIZE_LIMIT_MESSAGE + sizeLimitFileList.join('\n');
      this.notificationService.info(sizeLimitMessage);
    }
  }

  createParentFolders(fileList: File[]): Folder[] {
    this.sort(fileList);
    const folderList: Folder[] = [];
    const nodePathList: string[] = [];
    let createHeadFolder: boolean = false;
    for (const file of fileList) {
      // Create parent folders from the file path
      let path: string = file.path;
      for (let i = 0; i <= 100; i++) {
        const parsedPath: Parse = parsePath(path);
        path = parsedPath.parent;
        if (!nodePathList.includes(path)) {
          nodePathList.push(path);
          // Create a folder
          const folder = new Folder();
          folder.name = parsePath(path).name;
          folder.path = path;
          folderList.push(folder);
          if (parsedPath.length === 1) {
            // Current path is like this: "/file.txt"
            // Head folder not found. Create it.
            folder.name = 'zip';
            folder.path = '';
            createHeadFolder = true;
            break;
          }
        }
        if (parsedPath.length <= 2) {
          // Current path is like this: "/root/file.txt"
          // Less amount of nodes is not allowed.
          // Stop the loop.
          break;
        }
        if (i === 100) {
          // More than 100 sublevels in the folder? Isn't it too much?
          return undefined;
        }
      }
    }
    if (createHeadFolder) {
      [...fileList, ...folderList].forEach(file => {
        file.path = '/zip' + file.path;
      });
    }
    return folderList;
  }

  private sort(nodes: Node[]): void {
    nodes.sort((a, b) => {
      return this.dataService.sortABDefault(a, b);
    });
  }
}
