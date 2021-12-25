import { Injectable } from '@angular/core';

@Injectable()
export class MediaService {
  getExtension(filename: string): string {
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
    switch (this.getExtension(filename).toLowerCase()) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'ico':
      case 'webp': return true;
      default: return false;
    }
  }

  isText(filename: string): boolean {
    switch (this.getExtension(filename).toLowerCase()) {
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

  // Returns short form of mime type. Only type/subtype
  getMime(filename: string): string {
    switch (this.getExtension(filename)) {
      // Binary
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'gif': return 'image/gif';
      case 'ico': return 'image/x-icon';
      case 'webp': return 'image/webp';
      case 'webm': return 'video/webm';
      case 'mp3': return 'audio/mpeg';
      case 'wav': return 'audio/wav';
      case 'zip': return 'application/zip';
      // Text
      case 'html': return 'text/html';
      case 'json': return 'application/json';
      case 'js': return 'application/javascript';
      case 'xml': return 'application/xml';
      case 'proto': return 'application/protobuf';
      case 'css': return 'text/css';
      case 'scss': return 'text/scss';
      default: return 'text/plain';
    }
  }

  // Returns mime type. type/subtype[;parameter]
  getMimeType(filename: string): string {
    if (this.isText(filename)) {
      return 'text/plain;charset=utf-8';
    } else {
      return this.getMime(filename);
    }
  }

  getMediaType(filename: string): string {
    if (this.isText(filename)) {
      return 'text';
    } else if (this.isImage(filename)) {
      return 'image';
    } else {
      return 'binary';
    }
  }
}
