import { Parse } from '@/core/type';

export function parsePath(path: string): Parse {
  // /root/path/to/file.java -> ['root', 'path', 'to', 'file.java']
  const nodes: string[] = path.split('/').slice(1);
  return {
    length: nodes.length, // 4
    name: nodes.pop(), // 'file.java'
    parent: '/' + nodes.join('/'), // '/root/path/to'
  };
}
