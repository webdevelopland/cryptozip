import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import * as AES from 'aes-js';

import { Node, File, Folder, NodeMap, NodeInfo } from '@/core/type';
import {
  DataService,
  ZipService,
  ClipboardService,
  NotificationService,
  NodeService,
  LocationService,
} from '@/core/services';
import { parsePath, Path, parseFilename } from '@/core/functions';
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
    private locationService: LocationService,
  ) { }

  private addNewFile(name: string, ext: string): File {
    const path: string = Path.join(this.locationService.folder.path, name) + ext;
    const file: File = this.dataService.getFile(path);
    this.dataService.unselectAll();
    this.addFile(file);
    this.locationService.updateNode(file);
    this.dataService.modify();
    return file;
  }

  private addFile(file: File): File {
    const newName: string = this.getService.getNewName(file, this.locationService.folder.nodes);
    file.name = newName;
    file.path = Path.join(this.locationService.folder.path, newName);
    this.locationService.folder.push(file);
    file.isSelected = true;
    return file;
  }

  addTxtFile(): void {
    this.addNewFile('new_file', '.txt');
  }

  addGrid(): void {
    this.addNewFile('new_grid', '.grid');
  }

  createLink(node: Node): void {
    const nodeName: string = parseFilename(node.name)[0];
    const file: File = this.addNewFile(nodeName, '.link');
    file.block.binary = AES.utils.utf8.toBytes(node.path);
    this.dataService.modify();
  }

  addFolder(): void {
    const name: string = 'new_folder';
    const path: string = Path.join(this.locationService.folder.path, name);
    const folder: Folder = this.dataService.getFolder(path);
    const newName: string = this.getService.getNewName(folder, this.locationService.folder.nodes);
    folder.name = newName;
    folder.path = Path.join(this.locationService.folder.path, newName);
    this.locationService.folder.push(folder);
    this.locationService.updateNode(folder);
    this.dataService.modify();
    this.dataService.unselectAll();
    folder.isSelected = true;
  }

  delete(): void {
    this.getSelectedList().forEach(node => {
      const index: number = this.locationService.folder.nodes.indexOf(node);
      this.locationService.folder.nodes.splice(index, 1);
    });
    this.locationService.updateNode(this.locationService.folder);
    this.dataService.modify();
  }

  copy(): void {
    this.clipboardService.isCut = false;
    this.clipboardService.clipboard = [];
    this.clipboardService.location = this.locationService.folder;
    this.getSelectedList().forEach(node => {
      this.clipboardService.clipboard.push(node);
    });
  }

  cut(): void {
    this.copy();
    this.clipboardService.isCut = true;
  }

  getSelectedList(): Node[] {
    const selectedList: Node[] = [];
    for (const node of this.locationService.folder.nodes) {
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
      if (this.getService.isCutBlock(
        this.locationService.folder,
        this.clipboardService.clipboard,
      )) {
        this.notificationService.warning("You can't cut-paste a folder inside itself");
        return;
      }
      // Cut-paste a file to same location
      if (this.clipboardService.clipboard.length === 1) {
        const parent: string = parsePath(this.clipboardService.clipboard[0].path).parent;
        if (parent === this.locationService.folder.path) {
          // User tries to move file to the same location, where it was
          this.clipboardService.clearNodeCopyPaste();
          return;
        }
      }
    }
    let copiedNodes: Node[] = this.clipboardService.clipboard;
    // Add a number, if name is already taken
    const newNameMap: NodeMap = this.getService.getNewNameMap(
      this.locationService.folder,
      copiedNodes,
    );
    copiedNodes = copiedNodes.map(node => {
      const newName: string = newNameMap[node.id].name;
      const id: string = this.clipboardService.isCut ? node.id : undefined;
      const newPath: string = Path.join(this.locationService.folder.path, newName);
      if (node instanceof Folder) {
        const folder: Folder = this.branchService.copyFolder(node, newPath, id);
        folder.nodes = this.branchService.copyFolderNodes(node, newPath);
        return folder;
      } else if (node instanceof File) {
        return this.branchService.copyFile(node, newPath, id);
      }
    });
    this.dataService.unselectAll();
    for (const node of copiedNodes) {
      this.locationService.folder.push(node);
      node.isSelected = true;
    }
    if (this.clipboardService.isCut) {
      this.clipboardService.clipboard.forEach(node => {
        const index: number = this.clipboardService.location.nodes.indexOf(node);
        this.clipboardService.location.nodes.splice(index, 1);
      });
      this.clipboardService.clearNodeCopyPaste();
    }
    this.locationService.updateNode(this.locationService.folder);
    this.dataService.modify();
  }

  transferTo(): void {
    const selectedList: Node[] = this.getSelectedList();
    if (selectedList.length > 0) {
      this.sub(this.clipboardService.copyNode(selectedList).subscribe(ok => {
        if (ok) {
          this.notificationService.success('Copied');
        } else {
          this.notificationService.warning('Clipboard error');
        }
      }));
    }
  }

  readClipboard(): void {
    navigator.clipboard.readText()
      .then(clipboard => {
        this.transferFrom(clipboard);
      })
      .catch(() => {
        this.notificationService.warning('Clipboard error');
      });
  }

  transferFrom(base64: string): void {
    this.sub(this.clipboardService.pasteNode(base64).subscribe(nodes => {
      this.dataService.unselectAll();
      nodes.forEach(node => {
        if (node instanceof File) {
          this.addFile(node);
        } else if (node instanceof Folder) {
          node.name = this.getService.getNewName(node, this.locationService.folder.nodes);
          this.branchService.connectBranch(node, this.locationService.folder);
          this.locationService.folder.push(node);
          node.isSelected = true;
        }
      });
      this.locationService.updateNode(this.locationService.folder);
      this.dataService.modify();
    }, () => {
      this.notificationService.warning('Invalid file');
    }));
  }

  rename(node: Node, newName: string): void {
    node.name = newName;
    node.path = Path.join(this.locationService.folder.path, newName);
    this.dataService.pathMap[node.path] = node.id;
    if (node instanceof Folder) {
      this.branchService.renameAllChildren(node);
    }
    this.locationService.updateNode(node);
    this.dataService.modify();
  }

  importFiles(fileList: FileList): void {
    this.sub(this.branchService.getListOfFiles(fileList).subscribe(files => {
      if (files.length > 0) {
        files.map(file => {
          const newName: string = this.getService.getNewName(
            file,
            this.locationService.folder.nodes
          );
          file.name = newName;
          file.path = Path.join(this.locationService.folder.path, newName);
          return file;
        });
        for (const node of files) {
          this.locationService.folder.push(node);
        }
        this.locationService.updateNode(this.locationService.folder);
        this.dataService.modify();
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
      this.branchService.connectNodeList(this.locationService.folder, nodeList);
      this.locationService.folder.push(nodeList[0]);
      this.locationService.updateNode(this.locationService.folder);
      this.dataService.modify();
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
