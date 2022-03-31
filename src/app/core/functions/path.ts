export class Path {
  static join(...args: string[]): string {
    return args
      .map(path => {
        if (path && path.endsWith('/')) {
          path = path.replace(/(\/)+$/g, '');
        }
        return path;
      })
      .join('/');
  }
}
