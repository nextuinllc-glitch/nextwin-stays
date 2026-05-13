# Working notes for this codebase

## Writing style for user-facing text

**No em-dashes (` — `) in any user-visible string.**

This applies to property titles, descriptions, marketing copy, button
labels, error messages, i18n dictionaries, seed data, etc. Em-dashes are
the most recognisable signal of AI-generated text and the brand voice
should never read that way.

Acceptable substitutes:
- ` - ` (hyphen-minus with spaces) — the default, used in titles
- `, ` (comma) — when the second clause is parenthetical
- `:` — when introducing a list or explanation
- Just rephrase to drop the dash entirely

Code comments are not user-facing and may keep em-dashes for readability
during dev — the rule is about strings that ship to the browser.

When seeding new properties or writing new i18n keys, make sure the
content passes `grep -F " — " <file>` with zero results.
