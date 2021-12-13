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
}
