# Repository Guidelines

## Project Structure & Module Organization

This is a dependency-free Chrome Manifest V3 extension. `manifest.json` defines permissions, URL matches, and the popup entry point. UI lives in `popup/`: `mainPage/` renders bookings, `form/` holds shared form files, `*Form/` and `editForm/` hold platform views, and `module/` holds reusable ES modules. Injected automation belongs in `scripts/<platform>/`; shared helpers are in `scripts/common/`. Keep media in `assets/`.

Melon Ticket and Yes24 scripts are registered in the manifest. Interpark currently has popup forms and assets but no content-script implementation, so do not imply that its automation is complete.

## Development & Verification Commands

There is no install or build step. To run locally, open `chrome://extensions/`, enable Developer mode, choose **Load unpacked**, and select this repository root. After edits, click **Reload** on the extension card and refresh the target ticket page.

Useful pre-commit checks are:

```sh
python3 -m json.tool manifest.json >/dev/null  # validate manifest JSON
git diff --check                              # find whitespace errors
```

Docker is not used because this code must execute inside Chrome's extension and page contexts.

## Coding Style & Naming Conventions

Use four-space indentation and semicolons in new JavaScript. Prefer `camelCase` for JavaScript identifiers and `kebab-case` for CSS classes and HTML IDs. Preserve existing public `snake_case` helper names such as `get_stored_value`. Keep site-specific DOM selectors and flows isolated under the relevant lowercase platform directory. No formatter or linter is configured, so match nearby code and keep changes focused.

## Testing Guidelines

Run `node --test tests/*.test.js` for section parsing and Melon area-selection tests; no coverage threshold exists. Also verify popup create, edit, delete, and persistence behavior manually, then exercise each affected flow on the supported global site. Record the Chrome version and results in the pull request.

## Commit & Pull Request Guidelines

History uses short action-oriented subjects without Conventional Commit prefixes. Prefer specific messages such as `fix melon ticket seat selection`; avoid `update` or `temporary commit`. Pull requests should summarize behavior changes, identify affected platforms, list manual test steps, link related issues, and include screenshots or a GIF for UI changes. Call out any new permissions or URL matches.

## Security & Configuration

Use dummy phone, card, account, and booking data. Never commit or share real customer details; form values are stored with `chrome.storage.sync` and may sync across a signed-in Chrome profile. Minimize permissions and web-accessible resources, and note that automated booking may violate ticket-platform rules or trigger account bans.
