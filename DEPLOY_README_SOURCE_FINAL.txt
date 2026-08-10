History2 source/content final patch
Date: 2026-08-11

Purpose
- Restore the 12 remaining clipped original problem images from the uploaded Xi Story source PDF.
- Preserve all problem IDs, types, sources, stems, options and grading logic.
- Include the previously reviewed content-precision wording corrections.
- Make development storage/session behavior match app_mode_config.js while keeping release persistence/Firebase behavior intact.

Deploy
1. Extract this ZIP.
2. Copy all files into C:\GitHub\history and overwrite files with the same names.
3. GitHub Desktop: Commit -> Push origin.
4. Keep app_mode_config.js in development for device QA. Do not switch to release yet.

Validated
- 140 problems / 55 concepts retained.
- Original problem images decode successfully.
- Student/metacog problem images match.
- 12 newly restored questions match the source-book answer/explanation.
- Grading logic unchanged from V6.2.
- Inline JavaScript syntax: PASS.
- sync_local_hook.js syntax and development/release storage simulation: PASS.
