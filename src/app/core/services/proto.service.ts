import { Injectable } from '@angular/core';

import * as Proto from 'src/proto';
import { Tree, Node, File, Folder, BinaryBlock } from '@/core/type';
import { parsePath } from '@/core/functions';
import { DataService } from './data.service';

@Injectable()
export class ProtoService {
  constructor(
    private dataService: DataService,
  ) { }

  getProto(): BinaryBlock[] {
    const tree = new Proto.Tree();
    const meta = new Proto.Meta();
    meta.setId(this.dataService.tree.meta.id);
    meta.setEncryptorVersion(this.dataService.tree.meta.encryptorVersion);
    meta.setUpdateVersion(this.dataService.tree.meta.updateVersion);
    meta.setCreatedTimestamp(this.dataService.tree.meta.createdTimestamp);
    meta.setUpdatedTimestamp(this.dataService.tree.meta.updatedTimestamp);
    meta.setWriteKey(this.dataService.tree.meta.writeKey);
    tree.setMeta(meta);

    let position: number = 0;
    const blocks: BinaryBlock[] = [];
    for (const node of Object.values(this.dataService.nodeMap)) {
      if (node.isFolder) {
        const folder = new Proto.Folder();
        folder.setPath(node.path);
        folder.setCreatedTimestamp(node.createdTimestamp);
        folder.setUpdatedTimestamp(node.updatedTimestamp);
        folder.setTagList(node.tags);
        folder.setIndex(node.index);
        tree.addFolder(folder);
      } else if (node instanceof File) {
        const bb: BinaryBlock = node.block.copy();
        if (!bb.isModified) {
          // Take encrypted block from heap to reuse it
          bb.binary = this.dataService.getBlockBinary(bb);
        }
        const file: Proto.File = this.getProtoFile(node);
        const protoBlock = new Proto.Block();
        protoBlock.setPosition(position);
        protoBlock.setSize(bb.binary.length);
        protoBlock.setKey(bb.key);
        file.setBlock(protoBlock);
        tree.addFile(file);
        if (bb.binary.length) {
          blocks.push(bb);
          position += bb.binary.length;
        }
      }
    }
    blocks.unshift(new BinaryBlock(tree.serializeBinary()));
    return blocks;
  }

  setProto(binary: Uint8Array): void {
    const protoTree: Proto.Tree = Proto.Tree.deserializeBinary(binary);
    const protoMeta = protoTree.getMeta();
    const tree = new Tree();
    tree.meta = {
      id: protoMeta.getId(),
      encryptorVersion: protoMeta.getEncryptorVersion(),
      updateVersion: protoMeta.getUpdateVersion(),
      createdTimestamp: protoMeta.getCreatedTimestamp(),
      updatedTimestamp: protoMeta.getUpdatedTimestamp(),
      writeKey: protoMeta.getWriteKey_asU8(),
    };
    tree.root = this.getRoot(protoTree);
    tree.root.id = protoTree.getMeta().getId();
    this.dataService.setTree(tree);
  }

  getProtoFile(node: File): Proto.File {
    const file = new Proto.File();
    file.setPath(node.path);
    file.setCreatedTimestamp(node.createdTimestamp);
    file.setUpdatedTimestamp(node.updatedTimestamp);
    file.setTagList(node.tags);
    file.setIndex(node.index);
    return file;
  }

  getTransferFile(node: File): Proto.TransferFile {
    const file = new Proto.TransferFile();
    file.setPath(node.path);
    file.setCreatedTimestamp(node.createdTimestamp);
    file.setUpdatedTimestamp(node.updatedTimestamp);
    file.setTagList(node.tags);
    file.setIndex(node.index);
    this.dataService.decryptFile(node);
    file.setBinary(node.block.binary);
    return file;
  }

  getFile(protoFile: Proto.File | Proto.TransferFile): File {
    const file: File = this.dataService.getFile(protoFile.getPath());
    file.createdTimestamp = protoFile.getCreatedTimestamp();
    file.updatedTimestamp = protoFile.getUpdatedTimestamp();
    file.tags = protoFile.getTagList();
    file.index = protoFile.getIndex();
    if (protoFile instanceof Proto.File) {
      const block: Proto.Block = protoFile.getBlock();
      file.block.position = block.getPosition();
      file.block.size = block.getSize();
      file.block.key = block.getKey_asU8();
      file.block.isModified = false;
      file.block.isDecrypted = false;
    } else {
      file.block.binary = protoFile.getBinary_asU8();
      file.block.updateKey();
      file.block.isModified = true;
      file.block.isDecrypted = true;
    }
    return file;
  }

  private getNodeList(protoTree: Proto.Tree | Proto.Transfer): (File | Folder)[] {
    const nodeList: (File | Folder)[] = [];
    for (const protoFolder of protoTree.getFolderList()) {
      const folder: Folder = this.dataService.getFolder(protoFolder.getPath());
      folder.createdTimestamp = protoFolder.getCreatedTimestamp();
      folder.updatedTimestamp = protoFolder.getUpdatedTimestamp();
      folder.tags = protoFolder.getTagList();
      folder.index = protoFolder.getIndex();
      nodeList.push(folder);
    }
    for (const protoFile of protoTree.getFileList()) {
      nodeList.push(this.getFile(protoFile));
    }
    return nodeList;
  }

  getRoot(protoTree: Proto.Tree): Folder {
    const nodeList: (File | Folder)[] = this.getNodeList(protoTree);
    let root: Folder;
    for (const node of nodeList) {
      if (node.path === '/' && node instanceof Folder) {
        root = node;
        continue;
      }
      this.addToTree(nodeList, node);
    }
    return root;
  }

  readTransfer(transfer: Proto.Transfer): Node[] {
    const nodeList: (File | Folder)[] = this.getNodeList(transfer);
    let rootLength: number;
    for (const node of nodeList) {
      this.addToTree(nodeList, node);
      const length: number = parsePath(node.path).length;
      if (!rootLength || rootLength > length) {
        rootLength = length;
      }
    }
    return nodeList.filter(node => parsePath(node.path).length === rootLength);
  }

  getTransfer(nodes: Node[]): Proto.Transfer {
    const transfer = new Proto.Transfer();
    nodes.forEach(node => {
      if (node instanceof Folder) {
        Object.values(this.dataService.nodeMap)
          .filter(mapNode => mapNode.path.startsWith(node.path + '/') || mapNode.path === node.path)
          .forEach(mapNode => {
            if (mapNode.isFolder) {
              const folder = new Proto.Folder();
              folder.setPath(mapNode.path);
              folder.setCreatedTimestamp(mapNode.createdTimestamp);
              folder.setUpdatedTimestamp(mapNode.updatedTimestamp);
              folder.setTagList(mapNode.tags);
              folder.setIndex(mapNode.index);
              transfer.addFolder(folder);
            } else if (mapNode instanceof File) {
              transfer.addFile(this.getTransferFile(mapNode));
            }
          });
      } else if (node instanceof File) {
        transfer.addFile(this.getTransferFile(node));
      }
    });
    return transfer;
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
