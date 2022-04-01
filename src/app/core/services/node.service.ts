import { Injectable } from '@angular/core';

import { Node, File, Folder, NodeInfo } from '@/core/type';
import { round, timestampToDate } from '@/core/functions';
import { NotificationService } from './notification.service';

@Injectable()
export class NodeService {
  constructor(
    private notificationService: NotificationService,
  ) { }

  showProperties(
    nodeInfo: NodeInfo,
    createdTimestamp: number,
    updatedTimestamp: number,
    extra: string = '',
  ): void {
    let properties: string = '';
    properties += 'Size: ' + this.getSizeString(nodeInfo.size) + '\n';
    properties += 'Files: ' + nodeInfo.files + '\n';
    properties += 'Folders: ' + nodeInfo.folders + '\n';
    properties += 'Depth: ' + nodeInfo.depth + '\n';
    if (extra) {
      properties += extra + '\n';
    }
    properties += '\n';
    properties += 'Created: ' + timestampToDate(createdTimestamp) + '\n';
    properties += 'Updated: ' + timestampToDate(updatedTimestamp);
    this.notificationService.info(properties);
  }

  showListProperties(nodeInfo: NodeInfo): void {
    let properties: string = '';
    properties += 'Size: ' + this.getSizeString(nodeInfo.size) + '\n';
    properties += 'Files: ' + nodeInfo.files + '\n';
    properties += 'Folders: ' + (nodeInfo.folders - 1) + '\n';
    this.notificationService.info(properties);
  }

  getNodeInfo(node: Node): NodeInfo {
    if (node instanceof Folder) {
      let size: number = 0;
      let files: number = 0;
      let folders: number = 0;
      let depth: number = 0;
      for (const child of node.nodes) {
        const nodeInfo = this.getNodeInfo(child);
        size += nodeInfo.size;
        files += nodeInfo.files;
        folders += nodeInfo.folders;
        depth = Math.max(depth, nodeInfo.depth);
      }
      node.size = size;
      node.sizeString = this.getSizeString(size);
      return {
        size: size,
        files: files,
        folders: folders + 1,
        depth: depth + 1,
      };
    } else if (node instanceof File) {
      const size: number = this.getSizeOfFile(node);
      node.size = size;
      node.sizeString = this.getSizeString(size);
      return {
        size: size,
        files: 1,
        folders: 0,
        depth: 0,
      };
    }
  }

  private getSizeOfFile(file: File): number {
    if (file.block.isModified) {
      return file.block.binary.length;
    } else {
      return file.block.size;
    }
  }

  // bytes -> Kb, Mb, Gb
  getSizeString(bytes: number): string {
    if (bytes >= 1000000000) {
      return round(bytes / 1000000000, 2) + ' Gb';
    } else if (bytes >= 1000000) {
      return round(bytes / 1000000, 2) + ' Mb';
    } else if (bytes >= 1000) {
      return round(bytes / 1000, 2) + ' Kb';
    } else {
      return bytes + ' bytes';
    }
  }
}
