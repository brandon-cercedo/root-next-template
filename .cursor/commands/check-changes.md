# check-changes

Make a table of manual test cases for the given changes.

## Input

It is required. The user must say which changes to check.

For example:

- A branch name (`feat/chat-stats`)
- A PR link or number
- A commit range (`main...HEAD`)
- Uncommitted changes (`uncommitted`)

If no input is given, stop and ask for it. DO NOT guess a default.

## Steps

1. Read the changes for the given input.
2. Write test cases to ensure the changes work and do not break anything.

## Rules

- Skip checks for code these changes do not touch.
- Merge checks that overlap.
- Put the riskiest cases first.
- Keep steps short and in numbered order.

## Output

A single Markdown table with these columns:

| #   | Test case | Steps | Expected result |
| --- | --------- | ----- | --------------- |
