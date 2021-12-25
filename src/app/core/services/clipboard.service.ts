import { Injectable } from '@angular/core';

import { Node, Folder } from '@/core/type';

@Injectable()
export class ClipboardService {
  // Copied nodes
  clipboard: Node[] = [];
  isCut: boolean;
  location: Folder;

  copy(nodeList: Node[]): void {
    this.clipboard = nodeList;
    this.isCut = false;
  }

  cut(nodeList: Node[]): void {
    this.clipboard = nodeList;
    this.isCut = true;
  }

  // Was the node cutted?
  isNodeCut(node: Node): boolean {
    return this.isCut && this.clipboard.includes(node);
  }

  clearNodeCopyPaste(): void {
    this.clipboard = [];
    this.isCut = undefined;
    this.location = undefined;
  }

  clear(): void {
    this.clearNodeCopyPaste();
    navigator.clipboard.writeText('');
  }

  destroy() {
    this.clearNodeCopyPaste();
  }
}
