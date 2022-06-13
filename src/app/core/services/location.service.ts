import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as AES from 'src/third-party/aes';

import { Node, File, Folder, Location, LocationType } from '@/core/type';
import { parsePath } from '@/core/functions';
import { MediaService } from './media.service';
import { SearchService } from './search.service';
import { DataService } from './data.service';
import { NotificationService } from './notification.service';

@Injectable()
export class LocationService {
  path: string;
  folder: Folder; // Current folder (open in browser)
  file: File; // Current file (open in editor)
  history: Location[] = [];

  constructor(
    private router: Router,
    private mediaService: MediaService,
    private searchService: SearchService,
    private dataService: DataService,
    private notificationService: NotificationService,
  ) {
    this.dataService.dataChanges.subscribe(() => {
      this.updatePath(this.dataService.tree.root);
    });
  }

  updatePath(folder: Folder, isHistory: boolean = true): void {
    if (folder) {
      this.folder = folder;
      this.path = this.folder.path;
      if (isHistory) {
        this.add({
          type: LocationType.Folder,
          path: folder.path,
          node: folder,
        });
      }
    }
  }

  openFile(file: File): void {
    let locationType: LocationType;
    switch (this.mediaService.getMediaType(file.name)) {
      case 'text': locationType = LocationType.Text; break;
      case 'image': locationType = LocationType.Image; break;
      case 'grid': locationType = LocationType.Grid; break;
    }
    this.add({
      type: locationType,
      path: file.path,
      node: file,
    });
  }

  openSearch(path: string): void {
    this.add({
      type: LocationType.Search,
      path: path,
    });
  }

  add(location: Location): void {
    this.history.push(location);
  }

  back(): void {
    if (this.history.length > 1) {
      this.history.pop();
      const last: Location = this.history[this.history.length - 1];
      switch (last.type) {
        case LocationType.Text:
          this.file = last.node as File;
          this.router.navigate(['/browser/text']);
          break;
        case LocationType.Image:
          this.file = last.node as File;
          this.router.navigate(['/browser/image']);
          break;
        case LocationType.Grid:
          this.file = last.node as File;
          this.router.navigate(['/browser/grid']);
          break;
        case LocationType.Folder:
          this.updatePath(last.node as Folder, false);
          this.router.navigate(['/browser']);
          break;
        case LocationType.Search:
          this.router.navigate(['/browser/search']);
          break;
      }
    }
  }

  // Reset index for current folder and all its children
  resetIndexGlobally(folder: Folder): void {
    let path: string = folder.path + '/';
    path = path.replace(/(\/)+/g, '/');
    Object.values(this.dataService.nodeMap)
      .filter(node => node.path.startsWith(path) || node.path === folder.path)
      .forEach(node => this.resetIndex(node));
    this.dataService.sortAll();
    this.dataService.modify();
  }

  resetIndexLocally(folder: Folder): void {
    folder.nodes.forEach(node => this.resetIndex(node));
    this.updateNodeAndAllParents(folder);
    this.dataService.sort(folder);
    this.dataService.modify();
  }

  resetIndex(node: Node): void {
    if (node.index !== 0) {
      node.index = 0;
      this.updateNodeAndAllParents(node);
    }
  }

  updateNodeAndAllParents(node: Node): void {
    const now: number = this.dataService.updateNode(node);
    for (let i = 0; i < 100; i++) {
      const parent: Folder = this.getParent(node);
      if (!parent || parent.path === '/') {
        break;
      }
      parent.updatedTimestamp = now;
      node = parent;
    }
  }

  updateParent(file: File): void {
    const parent: Folder = this.getParent(file);
    if (parent) {
      this.updatePath(parent, false);
    }
  }

  getParent(node: Node): Folder {
    const parentPath: string = parsePath(node.path).parent;
    const parentId: string = this.dataService.pathMap[parentPath];
    const parent = this.dataService.nodeMap[parentId] as Folder;
    if (parent) {
      return parent;
    } else {
      console.error('Parent folder not found');
    }
  }

  openNode(node: Node): void {
    node.isSelected = true;
    if (node instanceof Folder) {
      this.updatePath(node);
      this.router.navigate(['/browser']);
    } else {
      this.file = node as File;
      switch (this.mediaService.getMediaType(node.name)) {
        case 'text':
          this.openFile(this.file);
          this.router.navigate(['/browser/text']);
          break;
        case 'image':
          this.openFile(this.file);
          this.router.navigate(['/browser/image']);
          break;
        case 'video':
          this.openFile(this.file);
          this.router.navigate(['/browser/video']);
          break;
        case 'grid':
          this.openFile(this.file);
          this.router.navigate(['/browser/grid']);
          break;
        case 'link': this.openLink(this.file); break;
        default: this.notificationService.warning("Binary file can't be opened");
      }
    }
  }

  openLink(file: File): void {
    this.dataService.decryptFile(file);
    const path: string = AES.utils.utf8.fromBytes(file.block.binary);
    const id: string = this.dataService.pathMap[path];
    if (id) {
      this.openNode(this.dataService.nodeMap[id]);
    } else {
      this.notificationService.warning('Not found');
    }
  }

  cancel(): void {
    this.history.pop();
  }

  destroy(): void {
    this.path = undefined;
    this.folder = undefined;
    this.file = undefined;
    this.history = [];
  }
}
