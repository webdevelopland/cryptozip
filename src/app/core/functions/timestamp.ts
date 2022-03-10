import { addZero } from './zero';

export function timestampToDate(timestamp: number): string {
  const date = new Date(timestamp);
  return addZero(date.getDate()) + '-' + addZero(date.getMonth() + 1) + '-' + date.getFullYear();
}
