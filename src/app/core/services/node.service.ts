import { Injectable } from '@angular/core';

import { Node, File, Folder, NodeInfo } from '@/core/type';
import { round, timestampToDate } from '@/core/functions';
import { NotificationService } from '@/core/services';

@Injectable()
export class NodeService {
  constructor(
    private notificationService: NotificationService,
  ) { }

  showProperties(
    nodeInfo: NodeInfo,
    createdTimestamp: number,
    updatedTimestamp: number,
  ): void {
    let properties: string = '';
    properties += 'Size: ' + this.getSizeString(nodeInfo.size) + '\n';
    properties += 'Files: ' + nodeInfo.files + '\n';
    properties += 'Folders: ' + nodeInfo.folders + '\n';
    properties += 'Depth: ' + nodeInfo.depth + '\n';
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
      return {
        size: size,
        files: files,
        folders: folders + 1,
        depth: depth + 1,
      };
    } else if (node instanceof File) {
      const size: number = this.getSizeOfFile(node);
      return {
        size: size,
        files: 1,
        folders: 0,
        depth: 0,
      };
    }
  }

  private getSizeOfFile(file: File): number {
    if (file.isBinary) {
      return file.binary.length;
    } else {
      return new Blob([file.text]).size;
    }
  }

  // bytes -> Kb, Mb, Gb
  getSizeString(bytes: number): string {
    if (bytes >= 1000000) {
      return round(bytes / 1000000, 2) + ' Mb';
    } else if (bytes >= 1000) {
      return round(bytes / 1000, 2) + ' Kb';
    } else {
      return bytes + ' bytes';
    }
  }
}