export class Path {
  static join(...args: string[]): string {
    return args
      .map(path => {
        if (path && path.endsWith('/')) {
          path = path.slice(0, -1);
        }
        return path;
      })
      .join('/');
  }
}
