import { Injectable } from '@angular/core';

import * as Proto from 'src/proto';
import { Data, Node, File, Folder } from '@/core/type';
import { parsePath } from '@/core/functions';
import { DataService } from './data.service';

@Injectable()
export class ProtoService {
  constructor(
    private dataService: DataService,
  ) { }

  getProto(): Uint8Array {
    const data = new Proto.Data();
    const meta = new Proto.Meta();
    meta.setId(this.dataService.data.meta.id);
    meta.setEncryptorVersion(this.dataService.data.meta.encryptorVersion);
    meta.setUpdateVersion(this.dataService.data.meta.updateVersion);
    meta.setCreatedTimestamp(this.dataService.data.meta.createdTimestamp);
    meta.setUpdatedTimestamp(this.dataService.data.meta.updatedTimestamp);
    data.setMeta(meta);
    for (const node of Object.values(this.dataService.nodeMap)) {
      if (node.isFolder) {
        const folder = new Proto.Folder();
        folder.setPath(node.path);
        folder.setCreatedTimestamp(node.createdTimestamp);
        folder.setUpdatedTimestamp(node.updatedTimestamp);
        folder.setTagList(node.tags);
        data.addFolder(folder);
      } else if (node instanceof File) {
        const file = new Proto.File();
        file.setPath(node.path);
        file.setIsBinary(node.isBinary);
        if (node.isBinary) {
          file.setBinary(node.binary);
        } else {
          file.setText(node.text);
        }
        file.setCreatedTimestamp(node.createdTimestamp);
        file.setUpdatedTimestamp(node.updatedTimestamp);
        file.setTagList(node.tags);
        data.addFile(file);
      }
    }
    return data.serializeBinary();
  }

  setProto(binary: Uint8Array): void {
    const protoData: Proto.Data = Proto.Data.deserializeBinary(binary);
    const data = new Data();
    data.meta = {
      id: protoData.getMeta().getId(),
      encryptorVersion: protoData.getMeta().getEncryptorVersion(),
      updateVersion: protoData.getMeta().getUpdateVersion(),
      createdTimestamp: protoData.getMeta().getCreatedTimestamp(),
      updatedTimestamp: protoData.getMeta().getUpdatedTimestamp(),
    };
    const nodeList: (File | Folder)[] = [];
    for (const protoFolder of protoData.getFolderList()) {
      const folder: Folder = this.dataService.getFolder(protoFolder.getPath());
      folder.createdTimestamp = protoFolder.getCreatedTimestamp();
      folder.updatedTimestamp = protoFolder.getUpdatedTimestamp();
      folder.tags = protoFolder.getTagList();
      nodeList.push(folder);
    }
    for (const protoFile of protoData.getFileList()) {
      const file: File = this.dataService.getFile(protoFile.getPath());
      file.isBinary = protoFile.getIsBinary();
      if (file.isBinary) {
        file.binary = protoFile.getBinary_asU8();
      } else {
        file.text = protoFile.getText();
      }
      file.createdTimestamp = protoFile.getCreatedTimestamp();
      file.updatedTimestamp = protoFile.getUpdatedTimestamp();
      file.tags = protoFile.getTagList();
      nodeList.push(file);
    }
    nodeList.sort((a, b) => {
      const aNodeLength: number = a.path.split('/').length;
      const bNodeLength: number = b.path.split('/').length;
      const aFolderStatus: number = a.isFolder ? 1 : 0;
      const bFolderStatus: number = b.isFolder ? 1 : 0;
      return (aNodeLength - aFolderStatus) - (bNodeLength - bFolderStatus);
    });
    for (const node of nodeList) {
      // Convert list to tree
      this.addToTree(nodeList, node);
    }

    data.root = nodeList[0] as Folder;
    data.root.id = protoData.getMeta().getId();
    this.dataService.setData(data);
  }

  // Adds a node to tree
  addToTree(nodeList: Node[], newNode: Node): void {
    const parent: string = parsePath(newNode.path).parent;
    for (const node of nodeList) {
      if (
        node.path !== newNode.path &&
        node.path === parent &&
        node instanceof Folder
      ) {
        node.nodes.push(newNode);
      }
    }
  }
}
