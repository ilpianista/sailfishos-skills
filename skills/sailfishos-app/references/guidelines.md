# SailfishOS Guidelines & Pitfalls

## Table of Contents
1. [UX Guidelines](#ux-guidelines)
2. [Harbour Validation](#harbour-validation)
3. [UI Components (Silica)](#ui-components-silica)
4. [Navigation](#navigation)
5. [Theming](#theming)
6. [Permissions (Sailjail)](#permissions-sailjail)
7. [D-Bus Integration](#d-bus-integration)
8. [Background Services](#background-services)
9. [Notifications](#notifications)
10. [Cover Pages](#cover-pages)
11. [General Tips](#general-tips)
12. [Pitfalls by Area](#pitfalls-by-area)

---

## UX Guidelines

### Design Philosophy
- **Simple** – Make complex experiences simpler
- **Aesthetic** – Balanced and beautiful
- **Natural** – Feels truly native
- **Magical** – Positive surprise and innovation
- **Holistic** – Connect user needs, technology, and business

### Core Principles
- Interaction via gestures over the entire screen, not tiny buttons
- Reduce UI chrome to absolute minimum — let content shine
- True multitasking: apps remain alive and usable as covers
- Use `Theme.*` for all sizes, margins, and colors

### UX Framework
| Surface | How to access |
|---|---|
| Lock screen | Double-tap or power key |
| Home (covers) | Edge swipe left/right from an app |
| Events | Right swipe from Home |
| Top Menu | Top-edge swipe from anywhere |
| App Grid | Bottom-edge swipe from anywhere |

### Gesture Conventions
- **Pull down** → Pulley menu (primary actions)
- **Push up** → Push-up menu (secondary actions)
- **Horizontal swipe** → Navigate between pages
- **Long-press** → Item actions menu
- **Edge swipe** → Back / home (do NOT add back buttons)

### Critical Implementation Rules
- `PageHeader` must appear at the top of every page — never create custom title bars
- Maximum **4 actions** in a pulley menu (landscape limit); hide menu if all items disabled
- Touch targets ≥ `Theme.itemSizeSmall`; most items should be `Theme.itemSizeMedium` or larger
- Add `VerticalScrollDecorator {}` to every `SilicaListView` / `SilicaFlickable`
- Use `RemorseItem` for per-row destructive actions, `RemorsePopup` for global ones
- Use `pageStack.replace()` instead of continually pushing pages (avoid deep stacks)
- Always set `allowedOrientations: Orientation.All` on every Page

### Label Coloring
| Element type | Color property |
|---|---|
| Interactive (buttons, switches) | `Theme.primaryColor` |
| Descriptive (labels, headers) | `Theme.highlightColor` |
| Pressed state | `Theme.highlightColor` |
| Secondary text | `Theme.secondaryColor` |

### Text Editor Configuration
Always set `placeholderText`, `label`, and configure the Enter key:
```qml
TextField {
    label: qsTr("Username")
    placeholderText: qsTr("Enter username")
    EnterKey.iconSource: "image://theme/icon-m-enter-next"
    EnterKey.onClicked: passwordField.focus = true
}
```

---

## Harbour Validation

Harbour is the official SailfishOS app store. Apps must pass automated + manual checks.

### Naming
- Binary and package name **must** start with `harbour-` (e.g. `harbour-myapp`)

### Allowed APIs
Only whitelisted Qt modules are permitted. Allowed:
- Qt5Core, Qt5Qml, Qt5Quick, Qt5Network, Qt5Concurrent, Qt5DBus, Qt5Multimedia
- QtSensors, sailfishapp, libsailfishsilica

NOT allowed:
- Private Qt headers or internal Silica APIs
- `libcontentaction` directly
- `QtQuick.Controls` (use `Sailfish.Silica` instead)

Full whitelist: https://docs.sailfishos.org/Develop/Apps/Harbour/Allowed_APIs/

### Icons
- Required sizes: **86×86, 108×108, 128×128, 172×172 px** (PNG)
- Transparent background; no pre-applied rounded corners or drop shadows
- The OS applies rounding and theming itself

### Desktop File
Must include: `Type=Application`, `Exec=`, `Icon=`, `Name=`

---

## UI Components (Silica)

### Core Layout
| Component | Purpose |
|---|---|
| `ApplicationWindow` | Root of every Sailfish app |
| `Page` | A single screen |
| `SilicaFlickable` | Scrollable area |
| `SilicaListView` | List with Sailfish-style scroll decorator |
| `SilicaGridView` | Grid view built on QtQuick's GridView |

### Controls (partial list)
| Component | Notes |
|---|---|
| `BackgroundItem` | Touchable item base — prefer over bare `MouseArea` |
| `ListItem` | Touchable list row with built-in highlight and menu support |
| `BusyIndicator` | Spinning wait indicator |
| `Button` | Text-labelled push button |
| `ComboBox` | Drop-down selector |
| `DatePicker` | Calendar grid |
| `IconButton` | Image-labelled push button |
| `IconTextSwitch` | Toggle with label and icon |
| `PasswordField` | Masked text input |
| `ProgressBar` | Horizontal progress |
| `RemorseItem` | Per-row destructive action with undo countdown |
| `RemorsePopup` | Global destructive action with undo countdown |
| `SectionHeader` | Visual group separator |
| `Slider` | Horizontal value selector |
| `TextSwitch` | Toggle with text label |
| `ValueButton` | Label + value display, tappable |
| `SearchField` | Search input with filter support |

---

## Navigation

```qml
// Push a new page
pageStack.push(Qt.resolvedUrl("NextPage.qml"))

// Push with properties
pageStack.push("NextPage.qml", { itemId: model.id })

// Go back
pageStack.pop()

// Replace current page (no back entry)
pageStack.replace(Qt.resolvedUrl("OtherPage.qml"))

// Attach a side page (swipe right from current)
onStatusChanged: {
    if (status === PageStatus.Active)
        pageStack.pushAttached(Qt.resolvedUrl("Details.qml"))
}
```

### PageStatus lifecycle
```qml
onStatusChanged: {
    if (status === PageStatus.Active)       { /* load data, start animations */ }
    if (status === PageStatus.Deactivating) { /* save state */ }
}
```
Load data only after `PageStatus.Active` — never in `Component.onCompleted` for pushed pages.

---

## Theming

### Color palette
| Property | Use |
|---|---|
| `Theme.primaryColor` | Active / interactive elements |
| `Theme.secondaryColor` | Less prominent UI areas |
| `Theme.highlightColor` | Non-interactive text, press highlights |
| `Theme.secondaryHighlightColor` | Less prominent highlighted areas |
| `Theme.highlightDimmerColor` | Dimming overlay |
| `Theme.highlightBackgroundColor` | Translucent highlight backgrounds |

### Icon sizes
| Property | Context |
|---|---|
| `Theme.iconSizeExtraSmall` | Home status area icons |
| `Theme.iconSizeSmall` | Cover actions, Events screen |
| `Theme.iconSizeMedium` | Common list item icons (default) |
| `Theme.iconSizeLarge` | Buttons, larger displays |
| `Theme.iconSizeLauncher` | App Grid icons |

### Font sizes
| Property | Context |
|---|---|
| `Theme.fontSizeTiny` | Severely space-constrained labels |
| `Theme.fontSizeSmall` | Secondary / paragraph text |
| `Theme.fontSizeMedium` | Default (Label, most controls) |
| `Theme.fontSizeLarge` | PageHeader, ViewPlaceholder |
| `Theme.fontSizeHuge` | Dominant text (keypad digits) |

### Rules
- **Never hardcode hex colors** — always use `Theme.*`
- Test with both dark and light ambience; use `Theme.colorScheme` to detect
- Semi-transparent overlay: `Theme.rgba(Theme.highlightBackgroundColor, Theme.highlightBackgroundOpacity)`

---

## Permissions (Sailjail)

Declare in the `[X-Sailjail]` section of the `.desktop` file:

```ini
[X-Sailjail]
Permissions=Internet;Location
OrganizationName=org.example
ApplicationName=harbour-myapp
```

### Common permission tokens
| Token | Access granted |
|---|---|
| `Internet` | Data connection / internet |
| `Location` | GPS and positioning |
| `Camera` | Camera hardware |
| `Microphone` | Microphone recording |
| `Audio` | Audio playback and recording |
| `Bluetooth` | Bluetooth hardware |
| `Contacts` | Read/write contacts |
| `Calendar` | Read/write calendar events |
| `Pictures` | Pictures directory and thumbnails |
| `Music` | Music directory and playlists |
| `Videos` | Videos directory and thumbnails |
| `Documents` | Documents directory |
| `Downloads` | Downloads directory |
| `UserDirs` | All user media dirs combined |
| `RemovableMedia` | Memory cards and USB sticks |
| `Phone` | Make phone calls |
| `Messages` | SMS access |
| `Email` | Read and send email |
| `Accounts` | User accounts |
| `AppLaunch` | Launch/stop systemd services (background tasks) |
| `MediaIndexing` | Tracker file indexing |
| `WebView` | Gecko-based WebView |
| `NFC` | NFC hardware |
| `Secrets` | Sailfish Secrets (since 4.5.0) |

---

## D-Bus Integration

### QML — call a D-Bus method
```qml
import QtDBus 2.2

DBusInterface {
    id: dbusIface
    service: "org.freedesktop.Notifications"
    path: "/org/freedesktop/Notifications"
    iface: "org.freedesktop.Notifications"

    function notify(summary, body) {
        call("Notify", ["harbour-myapp", 0, "", summary, body, [], {}, 5000])
    }
}
```

### QML — expose your app over D-Bus
```qml
DBusAdaptor {
    service: "org.example.harbour_myapp"
    path: "/org/example/harbour_myapp"
    iface: "org.example.harbour_myapp"
    function raise() { Qt.application.raise() }
}
```

---

## Background Services

### systemd user service file (`rpm/harbour-myapp-daemon.service`)
```ini
[Unit]
Description=harbour-myapp background service

[Service]
Type=simple
ExecStart=/usr/bin/harbour-myapp-daemon
Restart=on-failure

[Install]
WantedBy=sailfish-user-session.target
```

### QML heartbeat with nemo-keepalive
```qml
import Nemo.KeepAlive 1.2

BackgroundJob {
    triggeredBy: BackgroundJob.Heartbeat
    minimumWait: 15   // minutes

    onTriggered: {
        doWork()
        finished()    // MUST call finished() to release the wakelock
    }
}
```

### Prevent screen blanking
```qml
import Nemo.KeepAlive 1.2

DisplayBlanking {
    preventBlanking: player.playbackState === Audio.PlayingState
}
```

---

## Notifications

```qml
import Nemo.Notifications 1.0

Notification {
    id: notification
    appName: "harbour-myapp"
    appIcon: "/usr/share/icons/hicolor/86x86/apps/harbour-myapp.png"
    summary: qsTr("Task complete")
    body: qsTr("Your item has been processed.")
    isTransient: true
}

// notification.publish()
// notification.replacesId = savedId; notification.publish()  // update existing
// notification.close()
```

---

## Cover Pages

```qml
import QtQuick 2.0
import Sailfish.Silica 1.0

CoverBackground {
    Label {
        anchors.centerIn: parent
        text: appState.statusText
        font.pixelSize: Theme.fontSizeSmall
        color: Theme.secondaryColor
    }

    CoverActionList {
        CoverAction {
            iconSource: "image://theme/icon-cover-play"
            onTriggered: player.play()
        }
        CoverAction {
            iconSource: "image://theme/icon-cover-pause"
            onTriggered: player.pause()
        }
    }
}
```

Rules:
- Maximum **2 CoverAction** items
- No heavy animations — keep CPU usage minimal
- Icons must use the `image://theme/icon-cover-*` scheme

---

## General Tips

### SDK setup
```bash
# Download: https://docs.sailfishos.org/Develop/SDK_Installation/
sfdk tools list                             # see available targets
sfdk config target SailfishOS-4.5.0.18-armv7hl
sfdk cmake -B build -S .
sfdk cmake --build build
sfdk rpm
```

### Key resources
- Docs: https://docs.sailfishos.org
- Harbour FAQ: https://harbour.jolla.com/faq
- Silica reference: https://sailfishos.org/develop/docs/silica/
- Forum: https://forum.sailfishos.org
- Chum: https://github.com/sailfishos-chum/main

---

## Pitfalls by Area

### Harbour submission mistakes
- ❌ Binary doesn't start with `harbour-`
- ❌ Using private/internal Qt or Silica APIs
- ❌ Icon has rounded corners or shadows pre-applied
- ❌ Missing icon sizes (86, 108, 128, 172 px)
- ❌ Desktop file missing `Name`/`Exec`/`Icon` fields
- ❌ Requesting unnecessary permissions
- ❌ Hardcoded absolute paths — use `SailfishApp::pathTo()` or `Qt.resolvedUrl()`
- ❌ Using `QtQuick.Controls` — not whitelisted; use `Sailfish.Silica`

### QML pitfalls
- ❌ Hardcoded pixel sizes — use `Theme.fontSizeMedium` etc.
- ❌ Hardcoded colors — use `Theme.primaryColor` etc.
- ❌ Using bare `MouseArea` instead of `ListItem`/`BackgroundItem`
- ❌ Missing `VerticalScrollDecorator` in `SilicaListView`/`SilicaFlickable`
- ❌ Blocking the main thread — use `WorkerScript` or C++ async
- ❌ Loading heavy data before `PageStatus.Active`
- ❌ Mixing `anchors.fill` with `Column` children — use `width: parent.width`
- ❌ Forgetting `allowedOrientations` on every Page

### C++ pitfalls
- ❌ Not using `SailfishApp::main()` — it sets up QML paths automatically
- ❌ Blocking the GUI thread — use `QThread` / `QtConcurrent` / `QFuture`
- ❌ Manually deleting QML-owned objects — let QML manage lifetime
- ❌ Missing `Q_INVOKABLE` or `Q_PROPERTY` NOTIFY signals on exposed types
- ❌ Wrong `QStandardPaths` location — use `AppLocalDataLocation` for private storage

### CMake pitfalls
- ❌ Running plain `cmake` instead of `sfdk cmake` — missing cross-compilation toolchain
- ❌ Forgetting `set(CMAKE_AUTOMOC ON)` — `Q_OBJECT` macros won't expand
- ❌ Not linking `SAILFISHAPP_LIBRARIES` via `pkg_check_modules`
- ❌ Not passing `SAILFISHAPP_CFLAGS_OTHER` to `target_compile_options`
- ❌ Setting `CMAKE_INSTALL_PREFIX` — sfdk/RPM sets it; override causes misinstalls

### Permissions pitfalls
- ❌ No `[X-Sailjail]` section in `.desktop` — app runs in a restricted sandbox
- ❌ Missing `OrganizationName` / `ApplicationName` in `[X-Sailjail]`
- ❌ Requesting Camera/Mic permissions you never use — Harbour will reject

### Threading pitfalls
- ❌ Updating QML properties from a non-GUI thread — use `Qt::QueuedConnection`
- ❌ Calling `QThread::sleep()` on the main thread — use `QTimer` instead
- ❌ Sharing non-thread-safe Qt objects across threads

### Storage pitfalls
- ❌ Writing to the app install directory — it's read-only; use `AppLocalDataLocation`
- ❌ Missing `QCoreApplication::setOrganizationName/setApplicationName` before `QSettings`
- ❌ Not checking return values of `QFile` operations
- ❌ Storing large user files in private app data — use `~/Downloads` or media locations

---

## Coding Conventions

Reference: https://docs.sailfishos.org/Develop/Apps/Coding_Conventions/

For platform contributions, follow the conventions of the upstream project. For Sailfish apps,
follow Qt C++ / QML conventions with the Sailfish-specific extensions below.

### C++ conventions (Qt-style)

- Follow the [Qt Coding Conventions](https://wiki.qt.io/Qt_Coding_Style) as the baseline.
- **Prefer Qt5 signal/slot connection syntax** (compile-time checked):
  ```cpp
  // Correct (Qt5 style)
  connect(sender, &Sender::valueChanged, receiver, &Receiver::updateValue);

  // Avoid (Qt4 string-based, no compile-time check)
  connect(sender, SIGNAL(valueChanged(int)), receiver, SLOT(updateValue(int)));
  ```
- **Prefer C++11 range-for** over index-based loops:
  ```cpp
  for (const auto &item : items) { ... }   // correct
  for (int i = 0; i < items.size(); ++i)  // avoid unless index is needed
  ```
- **Use CamelCase for namespace names** (e.g. `MyFeature`, not `my_feature`).
- Header guards: use `#pragma once` or `#ifndef MYCLASS_H` style consistently per file.
- One class per header/source file pair; filename matches class name.

### QML conventions (Sailfish-specific)

- **Omit `;` after JavaScript function lines** inside QML:
  ```qml
  // Correct
  onClicked: {
      doSomething()
      doOther()
  }

  // Avoid
  onClicked: {
      doSomething();
      doOther();
  }
  ```
- **Put spaces between conditional statements, code, and curly braces**:
  ```qml
  if (condition) { doSomething() }   // correct
  if(condition){doSomething()}        // avoid
  ```
- **Write short single-expression handlers on one line**:
  ```qml
  onClicked: doSomething()
  ```
- **Omit redundant default property assignments**:
  ```qml
  // Avoid — visible: true is the default
  Label { visible: true; text: "hello" }

  // Correct
  Label { text: "hello" }
  ```
- **Don't define `id` if the id is never used** — it just adds clutter.
- **Use braces even in one-line conditionals** to avoid bugs on later edits:
  ```qml
  if (x > 0) { doSomething() }   // correct
  if (x > 0) doSomething()       // avoid
  ```
- **Group related properties** using the grouped form when available:
  ```qml
  font { pixelSize: Theme.fontSizeMedium; bold: true }
  anchors { left: parent.left; right: parent.right; margins: Theme.paddingMedium }
  ```
- **Avoid unnecessary negatives** — prefer the positive form when both are equivalent:
  ```qml
  visible: ready         // correct
  visible: !notReady     // avoid
  ```
- **Keep similar properties together** — id → property declarations → property bindings →
  signal handlers → child items → states → transitions.
- **Mark private internal properties and functions** with a leading underscore:
  ```qml
  property int _internalCounter: 0
  function _resetState() { ... }
  ```

### Testing conventions

- **Prefer `compare()` over `verify()`** when checking values in QML tests:
  ```qml
  compare(item.text, "expected")   // gives a useful diff on failure
  verify(item.text === "expected") // only says "false"
  ```
- **Use `SignalSpy` instead of `wait()`** for asynchronous signal assertions:
  ```qml
  SignalSpy { id: spy; target: myObj; signalName: "dataChanged" }
  spy.wait()
  compare(spy.count, 1)
  ```

### Project and deployment conventions

**Application project hierarchy:**
```
harbour-myapp/
├── src/           C++ sources
├── qml/           QML files (top-level .qml = app root)
│   ├── pages/
│   ├── cover/
│   └── components/
├── rpm/           RPM spec + changelog stubs
├── translations/  .ts source files (compiled .qm shipped in RPM)
├── icons/         86×86 108×108 128×128 172×172 PNG
└── APPNAME.desktop
```

**Application deployment folders on device:**
```
/usr/bin/harbour-myapp               executable
/usr/share/harbour-myapp/qml/        QML files
/usr/share/harbour-myapp/translations/ compiled .qm files
/usr/share/applications/harbour-myapp.desktop
/usr/share/icons/hicolor/86x86/apps/harbour-myapp.png
/usr/share/icons/hicolor/108x108/apps/harbour-myapp.png
/usr/share/icons/hicolor/128x128/apps/harbour-myapp.png
/usr/share/icons/hicolor/172x172/apps/harbour-myapp.png
```

---

## Harbour Allowed APIs (extended)

Full list: https://docs.sailfishos.org/Develop/Apps/Harbour/Allowed_APIs/
Also see: https://harbour.jolla.com/faq

### Allowed C/C++ libraries

| Library group | Key packages |
|---|---|
| Qt5 Core | Qt5Core, Qt5Qml, Qt5Quick, Qt5Network, Qt5Concurrent, Qt5DBus, Qt5Multimedia, Qt5Sensors, Qt5Svg, Qt5XmlPatterns |
| Sailfish | sailfishapp (libsailfishapp), libsailfishsilica |
| Sailfish Secrets | sailfish-secrets, sailfish-crypto |
| Sailfish WebView | sailfish-webengine (Gecko-based) |
| Amber | amber-web-authorization |
| OpenGL | libEGL, libGLESv1_CM, libGLESv2 |
| Nemo | nemo-qml-plugin-notifications, nemo-keepalive, nemo-qml-plugin-dbus |
| Standard C/C++ | libc, libstdc++, libm, libpthread |
| GLib | glib-2.0 (if unavoidable) |
| SDL2 | SDL2, SDL2_image, SDL2_mixer, SDL2_ttf |
| BluezQt | KF5BluezQt |

### Allowed QML imports

| Import | Notes |
|---|---|
| `Sailfish.Silica 1.0` | Primary UI toolkit — always use this |
| `Sailfish.Silica.private 1.0` | ❌ NOT allowed — private API |
| `QtQuick 2.x` | Base QML types |
| `QtQuick.Window 2.x` | Window management |
| `Qt.labs.folderlistmodel 2.x` | Folder listing |
| `QtQml.Models 2.x` | Data models |
| `QtGraphicalEffects 1.x` | Visual effects |
| `QtMultimedia 5.x` | Audio/video playback |
| `QtSensors 5.x` | Hardware sensors |
| `QtDBus 2.x` | D-Bus integration |
| `Nemo.KeepAlive 1.2` | Background wakelock + display blanking |
| `Nemo.Notifications 1.0` | System notifications |
| `Nemo.DBus 2.0` | Higher-level D-Bus QML helpers |
| `Amber.Mpris 1.0` | MPRIS media controls |
| `Amber.Web.Authorization 1.0` | OAuth2 flows |
| `Sailfish.WebView 1.0` | Gecko-based WebView |
| `Sailfish.Accounts 1.0` | Accounts integration |
| `org.nemomobile.contacts 1.0` | Contacts access |
| `org.nemomobile.folderlistmodel 1.0` | Alternative folder model |
| `Pyotherside 1.x` | Python ↔ QML bridge |

### Disallowed QML imports (Harbour will reject)
- `QtQuick.Controls` — use `Sailfish.Silica` instead
- `QtQuick.Controls 2.x` — same, not whitelisted
- Any `*.private` import
- `com.jolla.*` — internal Jolla APIs, not stable

### Harbour FAQ highlights
- Max RPM size: **50 MB** (check current limit at https://harbour.jolla.com/faq)
- App must be **self-contained** — do not depend on packages not in the allowed list
- No network access during install/uninstall (`%post`, `%preun` scriptlets must be offline)
- No `setuid`/`setgid` binaries
- No kernel modules
- Icon background must be transparent — the OS applies rounding and ambience tinting

---

## Pitfalls by Area (extended)

### GitHub Actions CI pitfalls
- ❌ Forgetting `submodules: recursive` — vendored deps won't be checked out
- ❌ Using `@master` in production — pin to a release tag for reproducibility
- ❌ Building only `armv7hl` — always include `aarch64` for newer devices
- ❌ Secrets in workflow YAML — use GitHub Secrets for tokens, API keys

### OBS / Chum pitfalls
- ❌ Using a branch (not a tag/hash) as the Chum submission revision — Chum requires pinned revisions
- ❌ License not in SPDX format — OBS rpmlint will fail the build
- ❌ Spec `Name:` not matching OBS package name — submit will be rejected
- ❌ Missing Chum metadata `%if 0%{?_chum}` block — package won't render correctly in Chum GUI
- ❌ BuildRequires not available in the selected repo — add Chum path to project Meta if needed

### Sailjail pitfalls (extended)
- ❌ Shipping `Sandboxing=Disabled` — Harbour will reject; always remove before submission
- ❌ No `[X-Sailjail]` section — app runs under a restrictive default profile (SFOS ≥ 4.4)
- ❌ `ExecDBus=` missing when app provides a D-Bus service — auto-start won't work
- ❌ Hardcoded paths outside auto-whitelisted dirs — use `QStandardPaths` and `OrganizationName`/`ApplicationName`
- ❌ Tracing left enabled in shipped `.desktop` file — remove `--trace` and `--dbus-log` flags before release
