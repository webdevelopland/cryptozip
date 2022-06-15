import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
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
  bookmarks: Location[] = [];
  isBookmark: boolean = false;
  fileChanges = new Subject<LocationType>();

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
      case 'video': locationType = LocationType.Video; break;
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
    this.checkBookmark(location);
  }

  back(): void {
    if (this.history.length > 1) {
      this.history.pop();
      const last: Location = this.history[this.history.length - 1];
      this.checkBookmark(last);
      switch (last.type) {
        case LocationType.Text:
          this.file = last.node as File;
          this.fileChanges.next(last.type);
          this.router.navigate(['/browser/text']);
          break;
        case LocationType.Image:
          this.file = last.node as File;
          this.fileChanges.next(last.type);
          this.router.navigate(['/browser/image']);
          break;
        case LocationType.Video:
          this.file = last.node as File;
          this.fileChanges.next(last.type);
          this.router.navigate(['/browser/video']);
          break;
        case LocationType.Grid:
          this.file = last.node as File;
          this.fileChanges.next(last.type);
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
    this.dataService.unselectAll();
    node.isSelected = true;
    if (node instanceof Folder) {
      this.updatePath(node);
      this.router.navigate(['/browser']);
    } else {
      this.file = node as File;
      switch (this.mediaService.getMediaType(node.name)) {
        case 'text':
          this.openFile(this.file);
          this.fileChanges.next(LocationType.Text);
          this.router.navigate(['/browser/text']);
          break;
        case 'image':
          this.openFile(this.file);
          this.fileChanges.next(LocationType.Image);
          this.router.navigate(['/browser/image']);
          break;
        case 'video':
          this.openFile(this.file);
          this.fileChanges.next(LocationType.Video);
          this.router.navigate(['/browser/video']);
          break;
        case 'grid':
          this.openFile(this.file);
          this.fileChanges.next(LocationType.Grid);
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

  addBookmark(): void {
    const currentLocation: Location = this.history[this.history.length - 1];
    const bookmark: Location = Object.assign({}, currentLocation);
    this.updateBookmarkPath(bookmark);
    this.bookmarks.push(bookmark);
  }

  updateBookmarkPath(bookmark: Location): void {
    const nodes: string[] = bookmark.node.path.split('/');
    bookmark.path = nodes.pop();
    bookmark.path = '/' + bookmark.path;
    if (nodes.length > 0) {
      bookmark.path = nodes.pop() + bookmark.path;
    }
    if (nodes.length === 1) {
      bookmark.path = '/' + bookmark.path;
    }
  }

  updateBookmarksPath(): void {
    this.bookmarks.forEach(bookmark => this.updateBookmarkPath(bookmark));
  }

  deleteBookmark(): void {
    const currentLocation: Location = this.history[this.history.length - 1];
    this.bookmarks.some((bookmark, i) => {
      if (bookmark.node.id === currentLocation.node.id) {
        this.bookmarks.splice(i, 1);
        return false;
      }
    });
  }

  checkBookmark(location: Location): void {
    if (location.node) {
      this.isBookmark = false;
      for (const bookmark of this.bookmarks) {
        if (bookmark.node.id === location.node.id) {
          this.isBookmark = true;
          break;
        }
      }
    }
  }

  clear(): void {
    this.clearDeletedLocations(this.history);
    this.clearDeletedLocations(this.bookmarks);
  }

  private clearDeletedLocations(locations: Location[]): void {
    const deleteMe: number[] = [];
    locations.forEach((location, i) => {
      if (!location.node) {
        return;
      }
      let isFound: boolean = false;
      for (const node of Object.values(this.dataService.nodeMap)) {
        if (node.id === location.node.id) {
          isFound = true;
          if (node.path !== location.node.path || node.path !== location.path) {
            // Update link to a variable, if node was cut-pasted
            location.path = node.path;
            location.node = node;
          }
          break;
        }
      }
      if (!isFound) {
        deleteMe.push(i);
      }
    });
    let deleted: number = 0;
    deleteMe.forEach(i => {
      // Clear deleted files
      locations.splice(i - deleted++, 1);
    });
  }

  cancel(): void {
    this.history.pop();
  }

  destroy(): void {
    this.path = undefined;
    this.folder = undefined;
    this.file = undefined;
    this.history = [];
    this.bookmarks = [];
    this.isBookmark = false;
  }
}
