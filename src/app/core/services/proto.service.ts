import { Injectable } from '@angular/core';
import * as AES from 'aes-js';

import * as Proto from 'src/proto';
import { Data, Node, File, Folder, BinaryBlock } from '@/core/type';
import { parsePath } from '@/core/functions';
import { DataService } from './data.service';

@Injectable()
export class ProtoService {
  constructor(
    private dataService: DataService,
  ) { }

  getProto(): BinaryBlock[] {
    const data = new Proto.Data();
    const meta = new Proto.Meta();
    meta.setId(this.dataService.data.meta.id);
    meta.setEncryptorVersion(this.dataService.data.meta.encryptorVersion);
    meta.setUpdateVersion(this.dataService.data.meta.updateVersion);
    meta.setCreatedTimestamp(this.dataService.data.meta.createdTimestamp);
    meta.setUpdatedTimestamp(this.dataService.data.meta.updatedTimestamp);
    data.setMeta(meta);

    let position: number = 0;
    const blocks: BinaryBlock[] = [];
    for (const node of Object.values(this.dataService.nodeMap)) {
      if (node.isFolder) {
        const folder = new Proto.Folder();
        folder.setPath(node.path);
        folder.setCreatedTimestamp(node.createdTimestamp);
        folder.setUpdatedTimestamp(node.updatedTimestamp);
        folder.setTagList(node.tags);
        data.addFolder(folder);
      } else if (node instanceof File) {
        const file: Proto.File = this.getProtoFile(node);
        let binary: Uint8Array;
        if (node.block.isModified) {
          if (node.isBinary) {
            binary = node.block.binary;
          } else {
            binary = AES.utils.utf8.toBytes(node.text);
          }
          blocks.push(new BinaryBlock(binary, true));
        } else {
          const start: number = node.block.position;
          const size: number = node.block.size;
          binary = this.dataService.blocks.slice(start, start + size);
          blocks.push(new BinaryBlock(binary, false));
        }
        const block = new Proto.Block();
        block.setPosition(position);
        block.setSize(binary.length);
        file.setBlock(block);
        position += binary.length;
        data.addFile(file);
      }
    }
    blocks.unshift(new BinaryBlock(data.serializeBinary(), true));
    return blocks;
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
    data.root = this.readData(protoData)[0] as Folder;
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

  getProtoFile(node: File): Proto.File {
    const file = new Proto.File();
    file.setPath(node.path);
    file.setIsBinary(node.isBinary);
    file.setCreatedTimestamp(node.createdTimestamp);
    file.setUpdatedTimestamp(node.updatedTimestamp);
    file.setTagList(node.tags);
    return file;
  }

  getProtoFileContent(node: File): Proto.File {
    this.dataService.decryptFile(node);
    const file: Proto.File = this.getProtoFile(node);
    if (node.isBinary) {
      file.setBinary(node.block.binary);
    } else {
      file.setText(node.text);
    }
    return file;
  }

  getFile(protoFile: Proto.File): File {
    const file: File = this.dataService.getFile(protoFile.getPath());
    file.isBinary = protoFile.getIsBinary();
    if (file.isBinary) {
      file.block.binary = protoFile.getBinary_asU8();
    } else {
      file.text = protoFile.getText();
    }
    file.createdTimestamp = protoFile.getCreatedTimestamp();
    file.updatedTimestamp = protoFile.getUpdatedTimestamp();
    file.tags = protoFile.getTagList();
    const block: Proto.Block = protoFile.getBlock();
    if (block) {
      file.block.position = block.getPosition();
      file.block.size = block.getSize();
      file.block.isModified = false;
      file.block.isDecrypted = false;
    }
    return file;
  }

  getData(nodes: Node[]): Proto.Data {
    const data = new Proto.Data();
    nodes.forEach(node => {
      if (node instanceof Folder) {
        Object.values(this.dataService.nodeMap)
          .filter(mapNode => mapNode.path.startsWith(node.path))
          .forEach(mapNode => {
            if (mapNode.isFolder) {
              const folder = new Proto.Folder();
              folder.setPath(mapNode.path);
              folder.setCreatedTimestamp(mapNode.createdTimestamp);
              folder.setUpdatedTimestamp(mapNode.updatedTimestamp);
              folder.setTagList(mapNode.tags);
              data.addFolder(folder);
            } else if (mapNode instanceof File) {
              data.addFile(this.getProtoFileContent(mapNode));
            }
          });
      } else if (node instanceof File) {
        data.addFile(this.getProtoFileContent(node));
      }
    });
    return data;
  }

  readData(protoData: Proto.Data): Node[] {
    const nodeList: (File | Folder)[] = [];
    for (const protoFolder of protoData.getFolderList()) {
      const folder: Folder = this.dataService.getFolder(protoFolder.getPath());
      folder.createdTimestamp = protoFolder.getCreatedTimestamp();
      folder.updatedTimestamp = protoFolder.getUpdatedTimestamp();
      folder.tags = protoFolder.getTagList();
      nodeList.push(folder);
    }
    for (const protoFile of protoData.getFileList()) {
      nodeList.push(this.getFile(protoFile));
    }
    nodeList.sort((a, b) => {
      return this.dataService.sortABDefault(a, b);
    });
    for (const node of nodeList) {
      // Convert list to tree
      this.addToTree(nodeList, node);
    }
    const rootLength: number = parsePath(nodeList[0].path).length;
    return nodeList.filter(node => parsePath(node.path).length === rootLength);
  }
}
