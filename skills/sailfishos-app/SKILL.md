---
name: sailfishos-app
description: >
  Expert assistant for SailfishOS application development. Use this skill whenever the user
  mentions SailfishOS, Sailfish OS, Jolla, sfdk, Sailfish SDK, Silica, harbour-*, RPM spec
  for Sailfish, or any SailfishOS-specific concepts (covers, pulley menus, Ambience, Sailjail,
  SailfishApp, Chum). Handles the full development lifecycle: bootstrapping new projects,
  scaffolding QML/C++ features, building and deploying with sfdk, providing curated UI/UX
  guidelines, pitfall warnings, and ready-to-paste code snippets. Trigger even for adjacent
  questions like "how do I add a settings page to my Sailfish app" or "what permissions do I
  need for location on Sailfish".
compatibility: bash_tool or terminal access required for build/deploy; file creation tools for scaffolding
---

# SailfishOS App Development Skill

This skill makes you an expert SailfishOS developer assistant. Use it to scaffold projects,
generate idiomatic QML/C++ code, run builds, and give precise platform guidance.

## Decision tree

| User wants to… | Action |
|---|---|
| Create a new app | [Scaffold project](#scaffolding-a-new-project) |
| Add a page / feature | [Add feature](#adding-features) |
| Build / clean / deploy | [Build & deploy](#building-and-deploying) |
| Ask about UI patterns, APIs, permissions | Load `references/guidelines.md` |
| See code for a common pattern | Load `references/snippets.md` |
| Get advice on pitfalls / anti-patterns | Load `references/guidelines.md` (Pitfalls section) |
| Add Chum store metadata | [Add Chum metadata](#adding-chum-metadata) |

Load a reference file only when you need it — don't preload all of them.

---

## Scaffolding a new project

Before writing any files, confirm the essentials with the user if not already clear:
- `name` — must start with `harbour-` (auto-prefix if omitted)
- `displayName` — human-readable title
- `description` — one sentence
- `outputDir` — where to create it
- `template` — `cmake` (default, recommended), `qmake`, or `qmlOnly`
- `organization` — reverse-domain prefix, e.g. `org.example`
- `openSource` — include Chum metadata block? (default true)

Read `references/templates.md` for the exact file contents to generate.

**Project layout to create** (substitute `APPNAME` = the full `harbour-*` name):

```
APPNAME/
├── CMakeLists.txt          (cmake) or APPNAME.pro (qmake/qmlOnly)
├── src/main.cpp            (cmake and qmake only)
├── rpm/
│   ├── APPNAME.spec
│   ├── APPNAME.changes.in
│   └── APPNAME.changes.run.in
├── qml/
│   ├── APPNAME.qml
│   ├── pages/
│   │   ├── FirstPage.qml
│   │   └── SecondPage.qml
│   └── cover/
│       └── CoverPage.qml
├── icons/
│   ├── 86x86/APPNAME.png   (stub — remind user to replace)
│   ├── 108x108/APPNAME.png
│   ├── 128x128/APPNAME.png
│   └── 172x172/APPNAME.png
├── translations/APPNAME.ts
├── APPNAME.desktop
├── .gitignore
├── .gitattributes
└── README.md
```

After creating all files, print the next-step commands:
```
cd APPNAME
sfdk config target <your-target>    # e.g. SailfishOS-4.5.0.18-armv7hl
sfdk cmake -B build -S .
sfdk cmake --build build
sfdk rpm
```

---

## Adding features

Read `references/templates.md` → **Feature Templates** section for the boilerplate.

| Feature type | Files created |
|---|---|
| `page` | `qml/pages/NAMEPage.qml` |
| `cover-page` | `qml/cover/CoverPage.qml` (replaces existing) |
| `settings-page` | `qml/pages/NAMESettingsPage.qml` |
| `dbus-interface` | `qml/dbus/NAMEInterface.qml` |
| `background-service` | `rpm/APPNAME-daemon.service` + `src/daemon/NAMEService.cpp` skeleton |
| `c++-backend` | `src/NAME.h` + `src/NAME.cpp` with `Q_OBJECT`, `Q_PROPERTY`, `Q_INVOKABLE` stubs |

After creating files, always explain how to wire the new file into the app (e.g. how to push the new page, how to register the C++ type in `main.cpp`).

---

## Building and deploying

Run these commands via bash. Always search for `sfdk` in PATH and common install paths if not found.

**Common sfdk locations:**
- `sfdk` (in PATH)
- `~/SailfishOS/bin/sfdk`
- `/opt/SailfishOS/bin/sfdk`

### Build
```bash
# Set target (only needed once per project)
sfdk config target SailfishOS-4.5.0.18-armv7hl

# Configure + build + package
sfdk cmake -B build -S .
sfdk cmake --build build
sfdk rpm
```

### Clean
```bash
sfdk cmake --build build --target clean
```

### Deploy
```bash
sfdk device list                        # see available devices
sfdk config device "Xperia 10 III"      # set active device
sfdk deploy --sdk
```

If `sfdk` is not found, tell the user to install the Sailfish SDK:
https://docs.sailfishos.org/Tools/Sailfish_SDK/Installation/

---

## Adding Chum metadata

Chum is the community app store: https://github.com/sailfishos-chum/main

Inject this block as the last paragraph of `%description` in the RPM spec, wrapped in `%if 0%{?_chum} … %endif`:

```spec
%if 0%{?_chum}
Title: DISPLAY_NAME
Type: desktop-application
DeveloperName: AUTHOR_NAME
Categories:
 - Other
Custom:
  Repo: REPO_URL
PackageIcon: ICON_URL
Links:
  Homepage: REPO_URL
  Bugtracker: REPO_URL/issues
  Help: REPO_URL/discussions
  Donation: DONATION_URL
%endif
```

Auto-detect missing values:
- `AUTHOR_NAME` → `git config user.name` inside the project dir
- `REPO_URL` → `git remote get-url origin`
- `ICON_URL` → construct from git remote + `icons/APPNAME.svg` path

---

## Guidelines and pitfalls reference

When answering questions about SailfishOS UI patterns, permissions, D-Bus, covers, theming,
navigation, or common mistakes, load `references/guidelines.md` and draw from the relevant section.

**Quick recall (no file load needed for these common facts):**

- App binary and package **must** start with `harbour-`
- Allowed icon sizes: 86×86, 108×108, 128×128, 172×172 px PNG (transparent background)
- Never hardcode colors — always use `Theme.*` properties
- Always add `VerticalScrollDecorator {}` to `SilicaListView` / `SilicaFlickable`
- Use `ListItem` / `BackgroundItem` instead of bare `MouseArea`
- Permissions declared in `[X-Sailjail]` section of the `.desktop` file
- Never use `QtQuick.Controls` — use `Sailfish.Silica` instead
- Build with `sfdk cmake` (not plain `cmake`) for cross-compilation

---

## Code snippets

When the user asks for example code for a specific pattern, load `references/snippets.md`
and return the relevant snippet. Available patterns:

`page-with-pulley`, `list-view-delegate`, `cover-page`, `settings-page`, `dbus-interface`,
`background-service`, `notification`, `file-picker`, `share-picker`, `theme-aware-colors`,
`keep-alive`, `remorse-item`, `section-header`, `search-field`

---

## SDK quick reference

```bash
sfdk tools list                             # list available build targets
sfdk config target SailfishOS-X.Y.Z-arch    # set active target
sfdk cmake -B build -S .                    # configure
sfdk cmake --build build                    # compile
sfdk rpm                                    # package → RPMS/
sfdk device list                            # list devices
sfdk config device "My Phone"               # set active device
sfdk deploy --sdk                           # install RPM on device
sfdk build-shell                            # open shell in build engine
```
