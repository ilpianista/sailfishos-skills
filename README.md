# SailfishOS MCP for OpenCode

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that supercharges [OpenCode](https://opencode.ai) with SailfishOS application development capabilities.

## Features

| Tool | What it does |
|------|-------------|
| `sailfish_create_project` | Scaffold a complete SailfishOS project (CMake, RPM spec, QML, icons, translations) |
| `sailfish_build` | Build the project with `sfdk` and produce an RPM |
| `sailfish_clean` | Clean the build directory |
| `sailfish_deploy` | Deploy the RPM to a connected device or emulator |
| `sailfish_guidelines` | Return curated guidelines for any SailfishOS topic |
| `sailfish_pitfalls` | List common mistakes for a development area |
| `sailfish_snippet` | Generate ready-to-use code snippets for common patterns |
| `sailfish_add_feature` | Add a new page, cover, service, D-Bus interface, or C++ backend |

## Prerequisites

- [TypeScript](https://www.typescriptlang.org/)
- [Sailfish SDK](https://docs.sailfishos.org/Tools/Sailfish_SDK/Installation/) with `sfdk` in your PATH (required for build/deploy tools)
- [OpenCode](https://opencode.ai)

## Installation

```bash
git clone https://github.com/ilpianista/sailfishos-mcp
cd sailfishos-mcp
npm install
npm run build
```

## Configuring OpenCode

Add this server to your OpenCode configuration file (`~/.config/opencode/config.json` or the project-local `.opencode/config.json`):

```json
{
  "mcp": {
    "sailfishos": {
      "type": "local",
      "command": [
        "node",
        "/absolute/path/to/sailfishos-mcp/dist/index.js"
      ],
      "enabled": true
    }
  }
}
```

Restart OpenCode — the SailfishOS tools will be available immediately.

---

## Usage Examples

### 1. Bootstrap a new app

> *"Create a new SailfishOS app called my-notes in ~/Projects. It's a simple note-taking app."*

OpenCode will call `sailfish_create_project` and produce:

```
~/Projects/harbour-my-notes/
├── CMakeLists.txt
├── rpm/
│   ├── harbour-my-notes.changes.in
│   ├── harbour-my-notes.changes.run.in
│   └── harbour-my-notes.spec
├── src/
│   └── main.cpp
├── qml/
│   ├── harbour-my-notes.qml
│   ├── pages/
│   │   ├── FirstPage.qml
│   │   └── SecondPage.qml
│   └── cover/
│       └── CoverPage.qml
├── icons/  (86, 108, 128, 172 px stubs)
└── translations/harbour-my-notes.ts
└── harbour-my-notes.desktop
```

### 2. Build the project

> *"Build my SailfishOS project at ~/Projects/harbour-my-notes for armv7hl"*

Runs:
```bash
sfdk config target SailfishOS-4.5.0.18-armv7hl
sfdk cmake -B build -S .
sfdk cmake --build build
sfdk rpm
```

### 3. Add a feature

> *"Add a detail page called NoteDetailPage to my project"*

Creates `qml/pages/NoteDetailPage.qml` with correct Silica boilerplate and explains how to navigate to it.

### 4. Get guidelines

> *"What are the Harbour submission requirements for icons?"*

Calls `sailfish_guidelines({ topic: "harbour-validation" })`.

### 5. Avoid pitfalls

> *"What are common QML mistakes on SailfishOS?"*

Calls `sailfish_pitfalls({ area: "qml" })` and returns an annotated list of anti-patterns.

### 6. Snippets on demand

> *"Show me how to do a pull-down menu in SailfishOS QML"*

Calls `sailfish_snippet({ pattern: "page-with-pulley", language: "qml" })`.

---

## Available Templates

| Template | Description |
|----------|-------------|
| `qmlOnlyTemplate` | Sailfish OS Qt Quick Application (QML Only) |
| `qmake` | Sailfish OS Qt Quick Application as QMake project |
| `cmake` | Sailfish OS Qt Quick Application as CMake project |

## Available Snippets

`page-with-pulley`, `list-view-delegate`, `cover-page`, `settings-page`, `dbus-interface`, `background-service`, `notification`, `file-picker`, `share-picker`, `theme-aware-colors`, `keep-alive`, `remorse-item`, `section-header`, `search-field`

## Available Guidelines Topics

`harbour-validation`, `ui-components`, `navigation`, `theming`, `permissions`, `dbus`, `background-services`, `notifications`, `covers`, `sailfishsilica`, `cmake`, `rpm-spec`, `general`, `ux-guidelines`

---

## Sailfish SDK Quick Reference

```bash
# List available build targets
sfdk tools list

# Set active target
sfdk config target SailfishOS-4.5.0.18-armv7hl

# Configure and build
sfdk cmake -B build -S .
sfdk cmake --build build

# Package as RPM
sfdk rpm

# List connected devices
sfdk device list

# Set active device
sfdk config device "Xperia 10 III"

# Deploy to device
sfdk deploy --sdk

# Open a shell inside the build engine
sfdk build-shell
```

---

## Project Structure Conventions

SailfishOS / Harbour apps follow strict conventions:

```
harbour-appname/          ← Must start with "harbour-"
├── CMakeLists.txt
├── rpm/
│   ├── harbour-appname.spec              ← RPM packaging
│   ├── harbour-appname.changes.in        ← Changelog file
│   └── harbour-appname.changes.run.in    ← Changelog script file
├── src/
│   └── main.cpp               ← Uses SailfishApp::main()
├── qml/
│   ├── harbour-appname.qml    ← ApplicationWindow root
│   ├── pages/
│   └── cover/
├── icons/
│   ├── 86x86/harbour-appname.png
│   ├── 108x108/harbour-appname.png
│   ├── 128x128/harbour-appname.png
│   └── 172x172/harbour-appname.png
├── translations/
│   └── harbour-appname.ts
└── harbour-appname.desktop
```

## Donate

[![Liberapay receiving](https://img.shields.io/liberapay/receives/ilpianista?logo=liberapay&label=ilpianista)](https://liberapay.com/ilpianista)

## License

MIT
