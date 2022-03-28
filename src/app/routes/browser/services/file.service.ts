import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { Node, File, Folder, NodeMap, NodeInfo } from '@/core/type';
import {
  DataService, ZipService, ClipboardService, NotificationService, NodeService
} from '@/core/services';
import { parsePath, Path } from '@/core/functions';
import { GetService } from './get.service';
import { BranchService } from './branch.service';

@Injectable()
export class FileService {
  subs: Subscription[] = [];

  constructor(
    public dataService: DataService,
    public zipService: ZipService,
    private clipboardService: ClipboardService,
    private notificationService: NotificationService,
    private getService: GetService,
    private branchService: BranchService,
    private nodeService: NodeService,
  ) { }

  private addFile(name: string, ext: string): void {
    const path: string = Path.join(this.dataService.folder.path, name) + ext;
    const file: File = this.dataService.getFile(path);
    file.text = '';
    const newName: string = this.getService.getNewName(file, this.dataService.folder.nodes);
    file.name = newName;
    file.path = Path.join(this.dataService.folder.path, newName);
    file.isBinary = false;
    this.dataService.folder.push(file);
    this.dataService.updateNode(file);
    this.branchService.unselectAll();
    file.isSelected = true;
  }

  addTxtFile(): void {
    this.addFile('new_file', '.txt');
  }

  addGrid(): void {
    this.addFile('new_grid', '.grid');
  }

  addFolder(): void {
    const name: string = 'new_folder';
    const path: string = Path.join(this.dataService.folder.path, name);
    const folder: Folder = this.dataService.getFolder(path);
    const newName: string = this.getService.getNewName(folder, this.dataService.folder.nodes);
    folder.name = newName;
    folder.path = Path.join(this.dataService.folder.path, newName);
    this.dataService.folder.push(folder);
    this.dataService.updateNode(folder);
    this.branchService.unselectAll();
    folder.isSelected = true;
  }

  delete(): void {
    this.getSelectedList().forEach(node => {
      const index: number = this.dataService.folder.nodes.indexOf(node);
      this.dataService.folder.nodes.splice(index, 1);
    });
    this.dataService.updateNode(this.dataService.folder);
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
      const newPath: string = Path.join(this.dataService.folder.path, newName);
      if (node instanceof Folder) {
        const folder: Folder = this.dataService.getFolder(newPath, id);
        folder.nodes = this.branchService.copyFolderNodes(node, newPath);
        return folder;
      } else if (node instanceof File) {
        const file: File = this.dataService.getFile(newPath, id);
        file.isBinary = node.isBinary;
        if (file.isBinary) {
          file.binary = node.binary;
        } else {
          file.text = node.text;
        }
        return file;
      }
    });
    this.branchService.unselectAll();
    for (const node of copiedNodes) {
      this.dataService.folder.push(node);
      node.isSelected = true;
    }
    if (this.clipboardService.isCut) {
      this.clipboardService.clipboard.forEach(node => {
        const index: number = this.clipboardService.location.nodes.indexOf(node);
        this.clipboardService.location.nodes.splice(index, 1);
      });
      this.clipboardService.clearNodeCopyPaste();
    }
    this.dataService.updateNode(this.dataService.folder);
  }

  transferTo(node: Node): void {
    if (node instanceof File) {
      this.clipboardService.copyFile(node);
      this.notificationService.success('Copied');
    } else {
      this.notificationService.warning('Folders are not supported yet');
    }
  }

  transferFrom(base64: string): void {
    const file: File = this.clipboardService.pasteFile(base64);
    if (file) {
      const newName: string = this.getService.getNewName(file, this.dataService.folder.nodes);
      file.name = newName;
      file.path = Path.join(this.dataService.folder.path, newName);
      this.dataService.folder.push(file);
      this.dataService.updateNode(file);
      this.branchService.unselectAll();
      file.isSelected = true;
    } else {
      this.notificationService.warning('Invalid file');
    }
  }

  rename(node: Node, newName: string): void {
    node.name = newName;
    node.path = Path.join(this.dataService.folder.path, newName);
    this.dataService.pathMap[node.path] = node.id;
    if (node instanceof Folder) {
      this.branchService.renameAllChildren(node);
    }
    this.dataService.updateNode(node);
  }

  importFiles(fileList: FileList): void {
    this.sub(this.branchService.getListOfFiles(fileList).subscribe(files => {
      if (files.length > 0) {
        files.map(file => {
          const newName: string = this.getService.getNewName(file, this.dataService.folder.nodes);
          file.name = newName;
          file.path = Path.join(this.dataService.folder.path, newName);
          return file;
        });
        for (const node of files) {
          this.dataService.folder.push(node);
        }
        this.dataService.updateNode(this.dataService.folder);
      }
    }));
  }

  importFolder(fileList: FileList): void {
    this.sub(this.branchService.getListOfFiles(fileList).subscribe(files => {
      // We get only file list from browser upload (not folders)
      const folderList: Folder[] = this.branchService.createParentFolders(files);
      if (folderList === undefined) {
        this.notificationService.warning('Folder is too big');
        return;
      }
      const nodeList: Node[] = files.slice();
      nodeList.push(...folderList);
      this.branchService.connectNodeList(this.dataService.folder, nodeList);
      this.dataService.folder.push(nodeList[0]);
      this.dataService.updateNode(this.dataService.folder);
    }));
  }

  showProperties(node: Node): void {
    const selectFolder = new Folder();
    selectFolder.nodes = this.getSelectedList();
    if (selectFolder.nodes.length > 1) {
      this.showListProperties(selectFolder);
    } else {
      this.showNodeProperties(node);
    }
  }

  private showNodeProperties(node: Node): void {
    const nodeInfo: NodeInfo = this.nodeService.getNodeInfo(node);
    const createdTimestamp: number = node.createdTimestamp;
    const updatedTimestamp: number = node.updatedTimestamp;
    this.nodeService.showProperties(nodeInfo, createdTimestamp, updatedTimestamp);
  }

  private showListProperties(folder: Folder): void {
    const nodeInfo: NodeInfo = this.nodeService.getNodeInfo(folder);
    this.nodeService.showListProperties(nodeInfo);
  }

  sub(sub: Subscription): void {
    this.subs.push(sub);
  }

  destroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
