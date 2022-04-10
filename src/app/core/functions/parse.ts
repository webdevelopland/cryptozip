import { Parse } from '@/core/type';

export function parsePath(path: string): Parse {
  path = path.replace(/(\\)+/g, '/');
  path = path.replace(/(\/)+/g, '/');
  if (path.startsWith('/')) {
    path = path.replace(/^(\/)+/g, '');
  }
  // /root/path/to/file.java -> ['root', 'path', 'to', 'file.java']
  const nodes: string[] = path.split('/');
  return {
    length: nodes.length, // 4
    name: nodes.pop(), // 'file.java'
    parent: '/' + nodes.join('/'), // '/root/path/to'
    nodes: nodes,
  };
}

// code.js.map -> [code, js.map]
export function parseFilename(filename: string): string[] {
  const name: string = filename.split('.').reverse().pop();
  const ext: string = filename.substr(name.length + 1, filename.length - 1);
  return [name, ext];
}

// code.js -> code
export function getName(filename: string, isFolder: boolean): string {
  if (isFolder) {
    return filename;
  } else {
    const fileparse: string[] = parseFilename(filename);
    return fileparse[0];
  }
}
