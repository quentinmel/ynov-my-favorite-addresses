export function map(items: any[], changeItem: (item: any) => any): any[] {
  const result: any[] = [];
  for (let i = 0; i < items.length; i++) {
    result[i] = changeItem(items[i]);
  }
  return result;
}
