---
name: sailfishos-app
description: >
  Expert assistant for SailfishOS application development. Use this skill whenever the user
  mentions SailfishOS, Sailfish OS, Jolla, sfdk, Sailfish SDK, Silica, harbour-*, RPM spec
  for Sailfish, or any SailfishOS-specific concepts (covers, pulley menus, Ambience, Sailjail,
  SailfishApp, Chum, OBS, GitHub Actions CI). Handles the full development lifecycle:
  bootstrapping new projects, scaffolding QML/C++ features, building and deploying with sfdk,
  CI/CD with GitHub Actions, publishing via OBS and Chum, Sailjail permission debugging,
  Harbour validation, coding conventions, and ready-to-paste code snippets. Trigger even for
  adjacent questions like "how do I add a settings page to my Sailfish app", "how do I publish
  to Chum", "why is my app blocked by Sailjail", or "how do I set up GitHub Actions for SFOS".
compatibility: bash_tool or terminal access required for build/deploy; file creation tools for scaffolding
---

# SailfishOS App Development Skill

This skill makes you an expert SailfishOS developer assistant. Use it to scaffold projects,
generate idiomatic QML/C++ code, run builds, set up CI/CD pipelines, publish to OBS/Chum,
and give precise platform guidance.

## Decision tree

| User wants to… | Action |
|---|---|
| Create a new app | [Scaffold project](#scaffolding-a-new-project) |
| Add a page / feature | [Add feature](#adding-features) |
| Build / clean / deploy | [Build & deploy](#building-and-deploying) |
| Set up GitHub Actions CI | [GitHub Actions CI](#github-actions-ci) |
| Publish via OBS | [OBS (Open Build Service)](#obs-open-build-service) |
| Submit to Chum store | [Chum submission](#chum-submission-via-obs) |
| Add Chum metadata to spec | [Add Chum metadata](#adding-chum-metadata) |
| Debug Sailjail permissions | [Sailjail debugging](#debugging-sailjail-permissions) |
| Ask about coding conventions | Load `references/guidelines.md` → Coding Conventions |
| Ask about UI patterns, APIs, permissions | Load `references/guidelines.md` |
| See code for a common pattern | Load `references/snippets.md` |
| Get advice on pitfalls / anti-patterns | Load `references/guidelines.md` (Pitfalls section) |
| Check Harbour allowed APIs | Load `references/guidelines.md` → Harbour Allowed APIs |

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
├── .github/
│   └── workflows/
│       └── build.yml       (see GitHub Actions CI section)
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

## GitHub Actions CI

Use the **CODeRUS/github-sfos-build** action to build RPMs in CI without a local SDK.
Builds run inside Docker containers from `coderus/sailfishos-platform-sdk`.
Available target tags: https://hub.docker.com/r/coderus/sailfishos-platform-sdk/tags

### Minimal `.github/workflows/build.yml`

```yaml
name: Build SailfishOS RPM

on:
  push:
    branches: [master, main]
  pull_request:
  release:
    types: [created]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        # Build for multiple targets; add/remove as needed
        target:
          - SailfishOS-4.5.0.18-armv7hl
          - SailfishOS-4.5.0.18-aarch64
          - SailfishOS-4.6.0.13-armv7hl
          - SailfishOS-4.6.0.13-aarch64

    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive   # important if you use git submodules

      - name: Build RPM
        uses: CODeRUS/github-sfos-build@master
        with:
          release: ${{ matrix.target }}
          # specFile: rpm/harbour-myapp.spec   # optional, auto-detected

      - name: Upload RPM artifact
        uses: actions/upload-artifact@v4
        with:
          name: rpm-${{ matrix.target }}
          path: RPMS/*.rpm
```

### Release workflow — attach RPMs to a GitHub Release

```yaml
name: Release SailfishOS RPM

on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        target:
          - SailfishOS-4.5.0.18-armv7hl
          - SailfishOS-4.5.0.18-aarch64
          - SailfishOS-4.6.0.13-armv7hl
          - SailfishOS-4.6.0.13-aarch64

    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Build RPM
        uses: CODeRUS/github-sfos-build@master
        with:
          release: ${{ matrix.target }}

      - name: Upload to GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: RPMS/*.rpm
```

### Key inputs for `CODeRUS/github-sfos-build`

| Input | Default | Description |
|---|---|---|
| `release` | (required) | Target string, e.g. `SailfishOS-4.5.0.18-armv7hl` |
| `specFile` | auto-detected | Path to `.spec` file relative to repo root |
| `arch` | parsed from `release` | Override architecture explicitly |

### Tips
- Pin to a specific tag (e.g. `@v2`) in production; `@master` always gets the latest.
- For multi-arch matrix, use `armv7hl` (32-bit ARM, most devices) and `aarch64` (64-bit ARM).
- `i486` is the emulator target; usually not needed in release builds.
- Built RPMs land in `RPMS/` inside the workspace.
- Set `submodules: recursive` if the repo uses git submodules for vendored dependencies.
- For GitLab CI, see the forum thread example at https://forum.sailfishos.org/t/2147

---

## OBS (Open Build Service)

The SailfishOS OBS at **https://build.sailfishos.org/** is the official community build platform.
It compiles RPMs from source for multiple SFOS versions and CPU architectures simultaneously.

### Account setup
Register at https://build.sailfishos.org/ (follow the front-page instructions).
Your home project URL will be:
`https://build.sailfishos.org/project/show/home:<username>`

### Creating your first OBS package

1. Open your home project → **Create Package**. Name must match the `.spec` filename (without `.spec`).
2. In the package page → **Add file** → upload your `.spec` file.
3. Set the **Source URL** to your git repository (OBS fetches sources from it).
4. Add build repositories in the project **Meta** config (XML editor):

```xml
<repository name="sailfish_latest_armv7hl">
  <path project="sailfishos:latest" repository="latest_armv7hl"/>
  <arch>armv8el</arch>
</repository>
<repository name="sailfish_latest_aarch64">
  <path project="sailfishos:latest" repository="latest_aarch64"/>
  <arch>aarch64</arch>
</repository>
```

5. OBS pulls sources, resolves `BuildRequires` from the `.spec`, and builds.
   Build logs and status appear live on the package page.

### Webhooks (auto-trigger on git push)

OBS can rebuild on every push via webhooks. In your git repo settings, add:
`POST https://build.sailfishos.org/trigger/webhook?project=home:<user>&package=<pkg>`

> **Chum exception**: Do **not** use webhooks for packages submitted to SailfishOS:Chum.
> Always specify a fixed git revision (tag or hash) for reproducible Chum builds.

### Using Chum as a build dependency

If your package depends on other Chum packages, include Chum in the Meta config:

```xml
<repository name="sailfish_latest_armv7hl">
  <path project="sailfishos:latest" repository="latest_armv7hl"/>
  <path project="sailfishos:chum" repository="4.5.0.18_armv7hl"/>
  <arch>armv8el</arch>
</repository>
```

---

## Chum submission via OBS

SailfishOS:Chum compiles everything from source on OBS — no binary uploads.
Full guide: https://github.com/sailfishos-chum/main/blob/main/GettingStarted.md

### Submission process

1. **Build your package** successfully in your OBS home project.
2. Ensure the `.spec` `License:` tag is a valid SPDX identifier from the
   [sailfish rpmlint allowlist](https://github.com/sailfishos/rpmlint/blob/master/rpm/sailfish.toml#L151-L458).
3. Add the [Chum metadata block](#adding-chum-metadata) to your `.spec`.
4. In OBS, navigate to your package → **Submit Package**.
5. Set target project: `sailfishos:chum:testing`
6. Specify a **git tag or commit hash** as the revision — not a branch.
7. Chum maintainers review; if accepted, the package enters `sailfishos:chum:testing`.
8. After validation it is promoted to the main `sailfishos:chum` repository.

### Rules for Chum packages
- Source is fetched directly from the public git repo where development happens.
- Pinned revision only — no moving branches for submitted packages.
- License in spec must be SPDX-compatible.
- Package name in spec must match the OBS package name exactly.
- For brand-new packages not yet on OBS: open an issue at https://github.com/sailfishos-chum/main

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

Valid `Type` values: `desktop-application`, `console-application`, `addon`, `codec`,
`inputmethod`, `firmware`, `driver`, `generic`.

Valid `Categories` (XDG spec + Chum extras): `AudioVideo`, `Audio`, `Video`, `Development`,
`Education`, `Game`, `Graphics`, `Network`, `Office`, `Science`, `System`, `Utility`, `Other`.

Auto-detect missing values:
- `AUTHOR_NAME` → `git config user.name` inside the project dir
- `REPO_URL` → `git remote get-url origin`
- `ICON_URL` → construct from git remote + `icons/APPNAME.svg` path

---

## Debugging Sailjail permissions

Sailjail is a thin Firejail wrapper that enforces app sandboxing since SFOS 4.4.
Full debug guide: https://github.com/sailfishos/sailjail/blob/master/APPDEBUG.md

### Step 1 — Check journald for sandbox violations

On device (as `devel-su` or root over SSH):
```bash
# Live stream — run before launching the app
journalctl -f | grep -i firejail

# Post-mortem — look for access violations
journalctl | grep -E '(firejail|sailjail|DENIED|violation)'
```

### Step 2 — Run with a sailjail filesystem trace

```bash
# Find the app's desktop file
rpm -qf /usr/bin/harbour-myapp
rpm -ql harbour-myapp | grep desktop

# Launch manually with trace enabled
sailjail --trace=/tmp/myapp-trace -p harbour-myapp.desktop /usr/bin/harbour-myapp

# Inspect the trace
cat /tmp/myapp-trace
```

### Step 3 — Enable D-Bus trace for D-Bus permission issues

Temporarily edit the `Exec=` line in the `.desktop` file:
```ini
Exec=/usr/bin/sailjail --trace=/tmp/myapp-trace --dbus-log=/tmp/myapp-dbus.log \
     -p harbour-myapp.desktop /usr/bin/harbour-myapp
```

Then filter the noisy D-Bus log for blocked calls:
```bash
grep -B2 -E '\*(HIDDEN|SKIPPED)\*' /tmp/myapp-dbus.log
```

### Step 4 — Add missing permission tokens

Identify the blocked resource in the trace and add the appropriate token to `[X-Sailjail]`:
```ini
[X-Sailjail]
Permissions=Internet;Location;Pictures
OrganizationName=org.example
ApplicationName=harbour-myapp
```

Browse available permission files on device: `ls /etc/sailjail/permissions/`
or in the upstream repo: https://github.com/sailfishos/sailjail-permissions

### Step 5 — Temporarily disable sandboxing (diagnosis only)

```ini
[X-Sailjail]
Sandboxing=Disabled
```
> ⚠️ Never ship with `Sandboxing=Disabled`. Harbour will reject the app.

### Automatic private-data whitelisting

Sailjail auto-whitelists three directories based on `[X-Sailjail]` values — these require no extra permission:
```
~/.local/share/<OrganizationName>/<ApplicationName>
~/.cache/<OrganizationName>/<ApplicationName>
~/.config/<OrganizationName>/<ApplicationName>
```

### Common sailjail pitfalls
- ❌ App silently fails at launch → likely missing permission; check journal first
- ❌ D-Bus calls silently dropped → add the relevant D-Bus service to permissions or use `--dbus-log`
- ❌ Files in `~/Downloads` inaccessible → add `Downloads` permission token
- ❌ Arbitrary `~/<CustomDir>` inaccessible → only predefined XDG dirs have tokens; others need `Sandboxing=Disabled` (not Harbour-allowed)
- ❌ `OrganizationName`/`ApplicationName` typo → private dirs not whitelisted; app can't save config
- ❌ `ExecDBus=` missing → app won't auto-start as a D-Bus service for `AppLaunch` pattern

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
- QML: omit `;` after JS function lines; use grouped property form (`font {}`, `anchors {}`)
- C++: prefer Qt5 signal/slot syntax; prefer C++11 range-for; use CamelCase namespaces

---

## Code snippets

When the user asks for example code for a specific pattern, load `references/snippets.md`
and return the relevant snippet. Available patterns:

`page-with-pulley`, `list-view-delegate`, `cover-page`, `settings-page`, `dbus-interface`,
`background-service`, `notification`, `file-picker`, `share-picker`, `theme-aware-colors`,
`keep-alive`, `remorse-item`, `section-header`, `search-field`

---

## SDK quick reference

### Target and device management
```bash
sfdk tools list                              # list installed SDKs and targets
sfdk tools install SailfishOS-4.6.0.13       # install a new SDK tooling version
sfdk config target SailfishOS-X.Y.Z-arch     # set active build target
sfdk config target                           # show current target
sfdk device list                             # list configured devices
sfdk config device "My Phone"                # set active device
sfdk config device                           # show current device
```

### Build (CMake)
```bash
sfdk cmake -B build -S .                     # configure
sfdk cmake --build build                     # compile
sfdk cmake --build build -- -j$(nproc)       # compile with all cores
sfdk cmake --build build --target clean      # clean
sfdk rpm                                     # package → RPMS/
sfdk rpm -- --without docs                   # pass extra rpmbuild flags
```

### Build (qmake)
```bash
sfdk qmake                                   # configure
sfdk make                                    # compile
sfdk make clean                              # clean
sfdk rpm                                     # package → RPMS/
```

### Deploy and run
```bash
sfdk deploy --sdk                            # install RPM on device via SDK
sfdk deploy --rsync                          # fast incremental deploy (no RPM rebuild)
sfdk run harbour-myapp                       # run on device, stream output
sfdk run -- harbour-myapp --some-arg         # run with arguments
sfdk debug harbour-myapp                     # attach GDB to app on device
```

### Build shell and SDK maintenance
```bash
sfdk build-shell                             # interactive shell in build engine
sfdk build-shell rpm -q sailfishapp          # run one command in build engine
sfdk maintain                                # SDK maintenance shell
sfdk check-updates                           # check for SDK updates
sfdk update                                  # apply SDK updates
```

### Signing packages (release)
```bash
gpg --gen-key                                          # generate signing key (one-time)
rpm --addsign RPMS/harbour-myapp-1.0-1.armv7hl.rpm    # sign an RPM
rpm --checksig RPMS/harbour-myapp-1.0-1.armv7hl.rpm   # verify signature
```
See: https://docs.sailfishos.org/Develop/Apps/Packaging/Signing_Packages

---

## Key resources

| Resource | URL |
|---|---|
| Sailfish docs | https://docs.sailfishos.org |
| Harbour FAQ | https://harbour.jolla.com/faq |
| Harbour allowed APIs | https://docs.sailfishos.org/Develop/Apps/Harbour/Allowed_APIs/ |
| Harbour allowed permissions | https://docs.sailfishos.org/Develop/Apps/Harbour/Allowed_Permissions/ |
| Coding conventions | https://docs.sailfishos.org/Develop/Apps/Coding_Conventions/ |
| Silica API reference | https://sailfishos.org/develop/docs/silica/ |
| OBS | https://build.sailfishos.org/ |
| Chum | https://github.com/sailfishos-chum/main |
| Chum getting started | https://github.com/sailfishos-chum/main/blob/main/GettingStarted.md |
| GitHub Actions build | https://github.com/CODeRUS/github-sfos-build |
| Docker SDK image tags | https://hub.docker.com/r/coderus/sailfishos-platform-sdk/tags |
| Sailjail debug guide | https://github.com/sailfishos/sailjail/blob/master/APPDEBUG.md |
| Sailjail permissions repo | https://github.com/sailfishos/sailjail-permissions |
| Forum | https://forum.sailfishos.org |
