# Fonts

Latin-subset variable WebFonts, self-hosted so the app works offline and makes no third-party requests.

| Family | File | Source | License |
|---|---|---|---|
| Inter | `inter-latin-wght-normal.woff2` | `@fontsource-variable/inter` 5.3.0 | SIL Open Font License 1.1 |
| Source Serif 4 | `source-serif-4-latin-opsz-normal.woff2` | `@fontsource-variable/source-serif-4` 5.3.0 | SIL Open Font License 1.1 |

Files were copied out of those packages rather than imported from them, because importing Fontsource's CSS pulls every unicode subset into the build and therefore into the PWA precache. Only latin is needed.

Source Serif 4 uses the **optical size** cut rather than the weight-only one, so headings pick up display optical sizing at large sizes and match the Figma reference. It costs ~71KB more. Inter uses the weight-only cut, which is all it needs.

To update, reinstall the package at the new version, copy the matching `files/*-latin-{opsz,wght}-normal.woff2` file here, and update the version in this table.
