const EDITABLE_ROLES = new Set(["textbox", "searchbox", "combobox"]);

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
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
