import { Injectable } from '@angular/core';

import { Node } from '@/core/type';

@Injectable()
export class MediaService {
  getExtension(filename: string): string {
    filename = filename.toLowerCase();
    const extensionRegExp: RegExp = /(?:\.([^.]+))?$/;
    const extension: string = extensionRegExp.exec(filename)[1];
    if (extension) {
      return extension;
    } else {
      if (filename !== '') {
        return filename;
      } else {
        return undefined;
      }
    }
  }

  isImage(filename: string): boolean {
    switch (this.getExtension(filename)) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'ico':
      case 'webp': return true;
      default: return false;
    }
  }

  isVideo(filename: string): boolean {
    switch (this.getExtension(filename)) {
      case 'mp4':
      case 'webm': return true;
      default: return false;
    }
  }

  isText(filename: string): boolean {
    switch (this.getExtension(filename)) {
      // Text
      case 'txt':
      case 'text':
      case 'log':
      case 'readme':
      case 'md':
      case 'html':
      case 'json':
      case 'js':
      case 'ts':
      case 'xml':
      case 'proto':
      case 'css':
      case 'scss':
      case 'py':
      case 'java':
      case 'php':
      case 'sh':
      case 'yaml':
      case 'c':
      case 'cpp':
      case 'gitignore':
      case 'npmignore':
      case 'firebaserc':
      case 'editorconfig':
      case 'license':
      case 'workspace':
      case 'build':
        return true;
      default:
        return false;
    }
  }

  // Returns mime type. type/subtype[;parameter]
  getMimeType(filename: string): string {
    switch (this.getExtension(filename)) {
      // Binary
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'gif': return 'image/gif';
      case 'ico': return 'image/x-icon';
      case 'webp': return 'image/webp';
      case 'webm': return 'video/webm';
      case 'mp4': return 'video/mp4';
      case 'mp3': return 'audio/mpeg';
      case 'wav': return 'audio/wav';
      case 'zip': return 'application/zip';
      case 'czip': return 'application/czip';
      case 'grid': return 'application/grid';
      // Text
      case 'json': return 'application/json';
      case 'js': return 'application/javascript';
      case 'xml': return 'application/xml';
      case 'proto': return 'application/protobuf';
      case 'html': return 'text/html;charset=utf-8';
      case 'css': return 'text/css;charset=utf-8';
      case 'scss': return 'text/scss;charset=utf-8';
      default: return 'text/plain;charset=utf-8';
    }
  }

  getMediaType(filename: string): string {
    if (this.isText(filename)) {
      return 'text';
    } else if (this.isImage(filename)) {
      return 'image';
    } else if (this.isVideo(filename)) {
      return 'video';
    } else if (this.getExtension(filename) === 'grid') {
      return 'grid';
    } else if (this.getExtension(filename) === 'link') {
      return 'link';
    } else {
      return 'binary';
    }
  }

  getIcon(node: Node): string {
    if (node.isFolder) {
      return 'folder';
    } else {
      switch (this.getMediaType(node.name)) {
        case 'text': return 'insert_drive_file';
        case 'grid': return 'grid_view';
        case 'link': return 'file_open';
        case 'image': return 'image';
        case 'video': return 'movie';
        default: return 'category';
      }
    }
  }
}
