const CONSOLE_BRAND_BANNER = `
%c _____   ____   ____ _______
|  __ \\ / __ \\ / __ \\__   __|
| |__) | |  | | |  | | | |
|  _  /| |  | | |  | | | |
| | \\ \\| |__| | |__| | | |
|_|  \\_\\\\____/ \\____/  |_|

Root Next Template
Base template to build Next.js applications.

Credits: https://github.com/brandon-cercedo
`.trimStart();

const CONSOLE_BRAND_STYLE = "font-family: monospace; color: #F7F8F8;";

export function logConsoleBrand(): void {
  if (typeof console === "undefined") {
    return;
  }

  console.log(CONSOLE_BRAND_BANNER, CONSOLE_BRAND_STYLE);
}
