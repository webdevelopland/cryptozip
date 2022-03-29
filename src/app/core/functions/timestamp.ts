import { addZero } from './zero';

export function timestampToDate(timestamp: number): string {
  const date = new Date(timestamp);
  let dateString: string = '';
  dateString += addZero(date.getHours());
  dateString += ':' + addZero(date.getMinutes());
  dateString += ':' + addZero(date.getSeconds());
  dateString += ' ';
  dateString += addZero(date.getDate());
  dateString += '-' + addZero(date.getMonth() + 1);
  dateString += '-' + date.getFullYear();
  return dateString;
}
