export function fixHTMLSelector(value: string) {
  if (!value) {
    return;
  }
  return value.startsWith("#") ? value : `#${value}`;
}
