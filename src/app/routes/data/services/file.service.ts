import { Injectable } from '@angular/core';
import { randstr } from 'rndmjs';

import { Node, File, Folder, Parse, NodeMap } from '@/core/type';
import { DataService, ZipService, ClipboardService, NotificationService } from '@/core/services';
import { parsePath } from '@/core/functions';
import { GetService } from './get.service';

@Injectable()
export class FileService {
  constructor(
    public dataService: DataService,
    public zipService: ZipService,
    private clipboardService: ClipboardService,
    private notificationService: NotificationService,
    private getService: GetService,
  ) { }

  addFile(): void {
    const name: string = 'new_file_' + randstr(12);
    const file: File = this.zipService.getFile(this.dataService.folder.path + '/' + name + '.txt');
    file.text = '';
    this.dataService.folder.push(file);
    this.dataService.nodeMap[file.id] = file;
    this.dataService.pathMap[file.path] = file.id;
    this.dataService.modify();
  }

  addFolder(): void {
    const name: string = 'new_folder_' + randstr(12);
    const folder: Folder = this.zipService.getFolder(this.dataService.folder.path + '/' + name);
    this.dataService.folder.push(folder);
    this.dataService.nodeMap[folder.id] = folder;
    this.dataService.pathMap[folder.path] = folder.id;
    this.dataService.modify();
  }

  delete(): void {
    this.getSelectedList().forEach(node => {
      const index: number = this.dataService.folder.nodes.indexOf(node);
      this.dataService.folder.nodes.splice(index, 1);
      this.dataService.removeNode(node);
    });
  }

  copy(): void {
    this.clipboardService.isCut = false;
    this.clipboardService.clipboard = [];
    this.clipboardService.location = this.dataService.folder;
    this.getSelectedList().forEach(node => {
      this.clipboardService.clipboard.push(node);
    });
  }

  cut(): void {
    this.copy();
    this.clipboardService.isCut = true;
  }

  private getSelectedList(): Node[] {
    const selectedList: Node[] = [];
    for (const node of this.dataService.folder.nodes) {
      if (node.isSelected) {
        selectedList.push(node);
      }
    }
    return selectedList;
  }

  paste(): void {
    if (this.clipboardService.clipboard.length === 0) {
      return;
    }
    // Cut exceptions
    if (this.clipboardService.isCut) {
      // Cut-paste a folder inside itself
      if (this.getService.isCutBlock(this.dataService.folder, this.clipboardService.clipboard)) {
        this.notificationService.warning("You can't cut-paste a folder inside itself");
        return;
      }
      // Cut-paste a file to same location
      if (this.clipboardService.clipboard.length === 1) {
        const parent: string = parsePath(this.clipboardService.clipboard[0].path).parent;
        if (parent === this.dataService.folder.path) {
          // User tries to move file to the same location, where it was
          this.clipboardService.clearNodeCopyPaste();
          return;
        }
      }
    }
    let copiedNodes: Node[] = this.clipboardService.clipboard;
    // Add a number, if name is already taken
    const newNameMap: NodeMap = this.getService.getNewNameMap(
      this.dataService.folder,
      copiedNodes,
    );
    copiedNodes = copiedNodes.map(node => {
      const newName: string = newNameMap[node.id].name;
      const id: string = this.clipboardService.isCut ? node.id : undefined;
      const newPath: string = this.dataService.folder.path + '/' + newName;
      if (node instanceof Folder) {
        const folder: Folder = this.zipService.getFolder(newPath, id);
        folder.nodes = this.getService.copyFolderNodes(node, newPath);
        return folder;
      } else {
        return this.zipService.getFile(newPath, id);
      }
    });
    for (const node of copiedNodes) {
      this.dataService.folder.push(node);
      this.dataService.addNode(node);
    }
    if (this.clipboardService.isCut) {
      this.clipboardService.clipboard.forEach(node => {
        const index: number = this.clipboardService.location.nodes.indexOf(node);
        this.clipboardService.location.nodes.splice(index, 1);
        this.dataService.removeNode(node);
      });
    }
    this.dataService.modify();
    this.clipboardService.clearNodeCopyPaste();
    this.getService.unselectAll();
  }

  rename(node: Node, newName: string): void {
    node.name = newName;
    node.path = this.dataService.folder.path + '/' + newName;
    this.dataService.pathMap[node.path] = node.id;
    if (node instanceof Folder) {
      this.getService.renameAllChildren(node);
    }
  }
}
