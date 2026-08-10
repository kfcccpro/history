# History2 Focus UX v6

Date: 2026-08-10

## Purpose

This build closes the latest visual/interaction review before moving the project to a new chat.

## Applied changes

- Rebuilt the Day intro mind map as a full-width, four-column left-to-right learning board.
- Removed the lower explanation drawer that caused vertical eye movement and attention splitting.
- The learning path is now fixed as: `오늘의 중심 -> 큰 가지 -> 핵심어 -> 설명/직접 입력`.
- The current path uses one calm guide line instead of many decorative wires.
- Key concepts reveal one at a time with a short horizontal transition.
- The final active-recall input stays in the rightmost column rather than moving below the map.
- Increased small/body/key-term typography throughout the learning flow.
- Increased answer-dock and remediation typography.
- Uses almost the full landscape viewport on PC/tablet.
- Question mode hides the left path rail and gives more space to the source image.
- Existing development QA mode remains active: progress/history persistence is not allowed to constrain testing.
- Final student release must re-enable progress/history/Firebase sync and pass the release checklist.

## Content integrity note

No Day problem images or problem-answer mappings were intentionally rewritten by this UX pass.
A static terminology/data audit report is included as `V6_CONTENT_AUDIT.md` and `V6_CONTENT_AUDIT.json`.
