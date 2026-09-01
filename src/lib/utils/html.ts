const EDITABLE_ROLES = new Set(["textbox", "searchbox", "combobox"]);

export function fixHTMLSelector(value: string) {
  if (!value) {
    return;
  }
  return value.startsWith("#") ? value : `#${value}`;
}

export function isMac() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /Mac|iPhone|iPod|iPad/i.test(navigator.platform);
}

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(tagName)) {
    return true;
  }

  if (target.isContentEditable) {
    return true;
  }

  const role = target.getAttribute("role");
  if (role && EDITABLE_ROLES.has(role)) {
    return true;
  }

  return false;
}
