# pr-screenshot

Screenshot what the user asks for and add it to a PR comment.

## Input

It is required. The user must say:

- **Which PR:** a number, a link, or the current branch's PR.
- **What to capture:** any screens or states the user wants to show.

If either is missing, stop and ask for it. DO NOT guess a default.

## Tools

Pick the first one available:

1. `agent-browser` skill.
2. `chrome-devtools` MCP.
3. The built-in agent browser.

If none is available, stop and tell the user.

## Steps

1. **Plan** each shot before opening a browser:
   - Write down:
     - Page: the URL to open.
     - Setup: data or sign-in the page needs first.
     - Actions: clicks or input that show the requested state.
   - If you can't tell how to reach a state, ask the user.
2. **Capture** each shot:
   - Viewport: 1440×900 unless the user asks otherwise.
   - Wait for loading and animations to finish.
   - Save to the scratchpad, review it, retake if wrong.
   - Close the browser when done; some tools can't reopen the profile.
3. **Open the PR:** Check for a signed-in user and a comment box. If
   missing, stop and ask the user to sign in.
4. **Upload** each image:
   - One at a time.
   - Drop it on the comment box, like a person would.
   - If no drag-and-drop action, dispatch `dragenter`, `dragover` and
     `drop` with the file in a `DataTransfer`.
   - Wait for its attachment link before the next one.
5. **Post** the comment and confirm it holds every image.
6. **Clean up:** close every tab and session you opened.

## Rules

- Post screenshots exactly as captured. Crop, trim or annotate only when
  the user asks.
- The comment holds only the images, plus a caption if the user writes one.
- Never expose credentials (passwords, tokens, keys):
  - Don't type, log or post them.
  - Don't upload any shot that shows one; retake it.
- Try any step at most 3 times. If it still fails, stop and explain why.

## Output

A link to the comment and a list of the images in it.
