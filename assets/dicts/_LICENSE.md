# Dictionary asset provenance

This directory holds dictionary JSON files that ship inside the APK.

Each file is sourced from a third-party word list. Origin and license
**must be audited per file** before any release outside internal testing.

| File | Original source | License | Audit status |
|------|-----------------|---------|--------------|
| `CET4_T.json` | `qwerty-learner/public/dicts/CET4_T.json` (mirror of the College English Test Band 4 standard vocabulary, 公有领域考试大纲词汇表) | Word list itself is the 中国教育部 CET4 standard vocabulary (factual / not copyrightable); JSON packaging from qwerty-learner repo (GPL-3.0). Treat the data as factual word list, not derivative code. | **Pending** — for internal MVP smoke testing only. Do not redistribute the JSON packaging on app stores until license review confirms factual-data carveout applies. |

When new dicts are added here, append a row above. Don't add any dict
without filling the audit column.
