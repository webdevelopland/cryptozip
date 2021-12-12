import { Injectable } from '@angular/core';
import { Params } from '@angular/router';

@Injectable()
export class UrlService {
  getQueryStringParams(query: string): Params {
    if (query) {
      return (/^[?#]/.test(query) ? query.slice(1) : query)
        .split('&')
        .reduce((params, param) => {
          const [key, value] = param.split('=');
          params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
          return params;
        }, {});
    } else {
      return {};
    }
  }

  getParam(): Params {
    return this.getQueryStringParams(window.location.search);
  }
}
