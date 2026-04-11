import type { GuidelineTopic, PitfallArea, SnippetPattern, SnippetLanguage } from "./types.js";

// ─── Guidelines ──────────────────────────────────────────────────────────────

const GUIDELINES: Record<GuidelineTopic, string> = {
   "ux-guidelines": `## SailfishOS UI/UX Guidelines

Combined guidelines from official SailfishOS documentation, Silica pitfalls, and Jolla design insights.

### Design Philosophy

- **Simple** – Make complex user experiences simpler
- **Aesthetic** – Design should be aesthetically pleasing, balanced and beautiful
- **Natural** – Designs should look and feel truly natural
- **Magical** – Positive surprise, innovation or personal sensation when using products
- **Holistic** – Create connections between user needs, technology and business requirements

### Core Design Principles

#### Effortless interaction
Interaction based on simple gestures supported by visual, tactile and audio feedback. Users interact via complete screen estate instead of tiny buttons.

#### True multitasking at its best
Quickly and seamlessly move around running apps. Stay up to date and get things done even after pushing apps away from foreground.

#### Reflect your ambiance
Easy tailoring of user experience enables users to create individual devices reflecting personal style and ambience.

#### All screen estate is yours
Reduce UI Chrome to absolute minimum letting user content shine.

#### Simply beautiful
Simple, beautiful and uncluttered designs. Content presented clearly with legible text and meaningful animations.

#### Logical
Consistent interaction flows and visuals for similar tasks creating fluent task flows.

#### Magical
Improve, innovate and create designs that make tasks easier and more pleasant.

#### Integrated services
Access service-related content during core tasks instead of opening dedicated apps.

### UX Framework

#### Lock Screen
Prevents accidental usage. Access via double-tap or power key. Shows time, date, notifications and system status. Unlock via left/right edge swipe.

#### Home
Center of Sailfish OS. Displays open apps as Covers. Switch between apps or use embedded Cover Actions.

#### Events
Notifications, weather and relevant information. Access via right swipe from Home.

#### Top Menu
Lock device, set to silent or switch Ambience. Access via top edge swipe from anywhere.

#### App Grid
Rearrange, group or delete apps. Access via bottom edge swipe from anywhere.

### Gestures

#### Tap
Brief touch performs default action.

#### Double Tap
Wake device when display off. Used for zooming in apps.

#### Edge Swipe
- Top edge: Top Menu
- Bottom edge: App Grid  
- Left/Right edge: Home (from apps) or Events/Partner space (from Home)

#### Navigation and Actions
- Pull down: Pulley menu
- Horizontal move: Navigate between pages
- Long-press: Item actions menu

### Navigation Architecture

#### Application Pages
Simple hierarchy compatible with common content types. Horizontal gestures for navigation.

#### Pulley Menu
Interactive extension of page. Place at top/bottom. Keep options below five for landscape orientation.

#### Dialogs
Use for user confirmation. Cancel via back gesture, accept via forward gesture.

### Critical Implementation Guidelines

#### Active Covers
Provide good summary of app contents and open tasks. Include shortcuts for common actions.

#### Label Coloring
- Interactive elements (buttons, switches): Use Theme.primaryColor
- Descriptive items (labels, headers): Use Theme.highlightColor
- Pressed state: Interactive elements should change to Theme.highlightColor

#### Alignment, Sizing and Spacing
- Graphics/images: Aligned flush with page edges
- Text/icons: Margin of Theme.horizontalPageMargin (left/right) and Theme.paddingLarge (top/bottom)
- Use Theme object for standard sizes, margins and colors

#### Touch Areas
Touchable items should not be smaller than Theme.itemSizeSmall. Most should be Theme.itemSizeMedium or larger.

#### Pulley Menus
Never show more than four actions. Hide menu if all items would be disabled.

#### Scroll Decorators
Add VerticalScrollDecorator to any view that may accumulate off-screen content.

#### Platform-Style Gestures
Use platform gestures instead of buttons:
- Dialog acceptance/cancellation: Use gestures, not buttons
- Navigation: Use edge swipes, not back buttons
- App exit: Use edge swipe to home, not exit buttons
- Toolbars: Use pulley menus, not traditional toolbars

#### Text Editor Configuration
- Always define placeholderText and label properties
- Configure Enter key for navigation or actions using EnterKey attached property

#### Page Hierarchies
Avoid unwieldy stacks. Consider using pageStack.replace() instead of continually pushing pages.
`,
  "harbour-validation": `## Harbour Validation Guidelines

Harbour is the official SailfishOS app store. Apps must pass automated and manual checks:

### Naming
- App binary and package MUST start with \`harbour-\` (e.g. \`harbour-myapp\`).

### Allowed APIs
- Only whitelisted Qt modules and libraries are permitted.
- Allowed: Qt5Core, Qt5Qml, Qt5Quick, Qt5Network, Qt5Concurrent, Qt5DBus, Qt5Multimedia, QtSensors, sailfishapp, libsailfishsilica.
- NOT allowed: private Qt headers, internal Silica APIs, libcontentaction directly.
- Full whitelist: https://docs.sailfishos.org/Develop/Apps/Harbour/Allowed_APIs/

### Icons
- Required sizes: 86×86, 108×108, 128×128, 172×172 px (PNG).
- Transparent background.

### Desktop File
- Must include \`Type=Application\`, \`Exec=\`, \`Icon=\`, \`Name=\`.
`,

  "ui-components": `## SailfishOS UI Components (Silica)

### Core Layout
| Component | Use |
|---|---|
| \`ApplicationWindow\` | Root of every Sailfish app |
| \`Page\` | A single screen |
| \`SilicaFlickable\` | Scrollable area |
| \`SilicaListView\` | List with Sailfish-style scrollbar |
| \`SilicaGridView\` | Grid view built on QtQuick's GridView type |

### Header
- Always use \`PageHeader\` at the top of a page.
- Don't create custom title bars.

### Menus
- \`PullDownMenu\` for primary actions.
- \`PushUpMenu\` for secondary actions.

### Controls
| Component | Notes |
|---|---|
| \`ButtonLayout\` | An item that lays out Button types
| \`BackgroundItem\` | A simple Sailfish-styled item for building touch-interactive items
| \`BusyIndicator\` | Displayed while waiting for content to load or some process to finish
| \`BusyLabel\` | Displayed while waiting for content to load or some process to finish
| \`Button\` | A push button with a text label
| \`ColorPicker\` | A grid of colors for selecting a color
| \`ComboBox\` | A combo box control for selecting from a list of options
| \`DatePicker\` | A calendar grid for selecting a date
| \`GridItem\` | A simple Sailfish-styled item for building touch-interactive grid items
| \`HighlightImage\` | An image with highlight effect
| \`IconButton\` | A push button with an image
| \`IconTextSwitch\` | A toggle button with a label and an icon
| \`Keypad\` | A dialer-type keypad
| \`ListItem\` | A simple Sailfish-styled item for building touch-interactive list items
| \`PageBusyIndicator\` | Displayed while waiting for page to load
| \`PagedView\` | A paged item view
| \`PasswordField\` | A text field for password entry
| \`ProgressBar\` | A horizontal progress bar
| \`Remorse\` | Shows prompts that brief allow destructive actions to be canceled
| \`RemorseItem\` | Shows an item that briefly allows a destructive action to be canceled
| \`RemorsePopup\` | Shows a pop-up that briefly allows a destructive action to be canceled
| \`Separator\` | A horizontal separator
| \`Slider\` | A horizontal slider
| \`Switch\` | A toggle button with an icon
| \`TextSwitch\` | A toggle button with a label
| \`TimePicker\` | A clock face for selecting a time
| \`TouchBlocker\` | An item that accepts all mouse and touch input
| \`ValueButton\` | A clickable control that displays a label and a value
`,

  navigation: `## SailfishOS Navigation Patterns

### Stack navigation
- \`pageStack.push(Qt.resolvedUrl("NextPage.qml"))\` — navigate forward.
- Hardware Back key / \`pageStack.pop()\` — navigate back.
- Pass data: \`pageStack.push("Page.qml", { prop: value })\`.

### Replace
- \`pageStack.replace()\` replaces current page without a back entry.

### Attached pages
\`\`\`qml
onStatusChanged: {
    if (status === PageStatus.Active)
        pageStack.pushAttached(Qt.resolvedUrl("Details.qml"))
}
\`\`\`

### PageStatus
\`\`\`qml
onStatusChanged: {
    if (status === PageStatus.Active) { /* load data */ }
    if (status === PageStatus.Deactivating) { /* save state */ }
}
\`\`\`
`,

  theming: `## SailfishOS Theming

### Palette
| Property | Use |
|---|---|
| \`Theme.primaryColor\` | adds emphasis to active areas of the UI |
| \`Theme.secondaryColor\` | used to paint less prominent parts of the UI |
| \`Theme.highlightColor\` | main color for non-interactive text and press highlights |
| \`Theme.secondaryHighlightColor\` | used to paint less prominent parts of the UI in a highlighted manner |
| \`Theme.highlightDimmerColor\` | used to paint the highlight color with a darker shade (for example, when dimming a region to bring attention to other areas of the UI) |

### Icons sizing

| Property | Use |
|---|---|
| \`Theme.iconSizeExtraSmall\` | suits the smallest icons, such as those in the Home status area |
| \`Theme.iconSizeSmall\` | suits small icons, such as CoverAction icons and icons on the Events screen |
| \`Theme.iconSizeSmallPlus\` | a larger variant of iconSizeSmall, used for notification icons |
| \`Theme.iconSizeMedium\` | the most common icon size; suits icons in small to medium-sized list items |
| \`Theme.iconSizeLarge\` | suits larger icon displays and buttons |
| \`Theme.iconSizeExtraLarge\` | suits very large icon displays |
| \`Theme.iconSizeLauncher\` | for icons in the Home app grid |

### Text sizing

| Property | Use |
|---|---|
| \`Theme.fontSizeTiny\` | the smallest recommended font size; for use where space is severely restricted |
| \`Theme.fontSizeExtraSmall\` | for smaller secondary text, such as the description text in TextSwitch and ValueButton |
| \`Theme.fontSizeSmall\` | for general secondary text or paragraphs of non-interactive text |
| \`Theme.fontSizeMedium\` | the most common text size; this is the default font size of Label and most UI controls |
| \`Theme.fontSizeLarge\` | for large heading text, such as those of PageHeader and ViewPlaceholder |
| \`Theme.fontSizeExtraLarge\` | for larger heading text |
| \`Theme.fontSizeHuge\` | for very large headings or UI components where the text dominates, such as in a keypad button |

### Light vs dark ambience
- Test with both; use \`Theme.colorScheme\` to detect.
- Never hardcode hex colors.
`,

  permissions: `## SailfishOS Permissions

### Declaring permissions
Add a \`[X-Sailjail]\` section to your \`.desktop\` file:
\`\`\`ini
[X-Sailjail]
Permissions=Internet;Location
OrganizationName=org.example
ApplicationName=harbour-myapp
\`\`\`

### Common tokens
| Token | Access |
|---|---|
| \`Accounts\`   | Using accounts, including editing them. Syncing accounts. |
| \`Ambience\`   | Set and edit ambiences. |
| \`AppLaunch\`  | Launching and stopping systemd services. This is usually needed for background tasks. |
| \`ApplicationInstallation\` | Installing and uninstalling applications. |
| \`Audio\` | Playing and recording audio (since Pulseaudio streams cannot be separated both are enabled with this, but it is subject to change), changing audio configuration and showing audio controls on lockscreen. |
| \`Bluetooth\` | Connecting to and using Bluetooth hardware. |
| \`Calendar\` | Display and editing of calendar events. |
| \`CallRecordings\` | Access recorded calls. |
| \`Camera\` | Access to camera hardware to take photos or video. |
| \`CommunicationHistory\` | Access call and message history. |
| \`Contacts\` | Display and editing of contacts data. Access to contact cards. |
| \`Documents\` | Access to Documents directory. |
| \`Downloads\` | Access to Downloads directory. |
| \`Email\` | Reading and sending emails. Access to email attachments. |
| \`Internet\` | Using data connection and connecting to internet. |
| \`Location\` | Use GPS and positioning. |
| \`MediaIndexing\` | Access to Tracker to list files on device. If you have access to a data directory, you may want to use also this. |
| \`Messages\` | Access to message data and to send SMS messages. |
| \`Microphone\` | Record audio with microphone. Use Audio permission for playback of the recorded audio (but since Pulseaudio streams cannot be separated this enables also audio playback, which is subject to change). |
| \`Music\` | Access to Music directory, playlists and coverart cache. |
| \`NFC\` | Connecting to and using NFC hardware. |
| \`Phone\` | Make Phone calls, either directly or through system voice call UI. |
| \`Pictures\` | Access to Pictures directory and thumbnails. |
| \`PublicDir\` | Access to Public directory. |
| \`RemovableMedia\` | Use memory cards and USB sticks. |
| \`Secrets\` | Access to Sailfish Secrets. Since 4.5.0 |
| \`Synchronization\` | Access to synchronization framework. |
| \`UserDirs\` | Access to Documents, Downloads, Music, Pictures, Public and Video directories. |
| \`Videos\` | Access to Videos directory and thumbnails. |
| \`WebView\` | If you use Gecko based WebView you need this. |
`,

  dbus: `## D-Bus Integration

### QML D-Bus call
\`\`\`qml
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
\`\`\`

### Exposing your app
\`\`\`qml
DBusAdaptor {
    service: "org.example.harbour_myapp"
    path: "/org/example/harbour_myapp"
    iface: "org.example.harbour_myapp"
    function raise() { Qt.application.raise() }
}
\`\`\`
`,

  "background-services": `## Background Services

### systemd user service
\`\`\`ini
[Unit]
Description=harbour-myapp background service

[Service]
Type=simple
ExecStart=/usr/bin/harbour-myapp-daemon
Restart=on-failure

[Install]
WantedBy=sailfish-user-session.target
\`\`\`

### nemo-keepalive (QML)
\`\`\`qml
import Nemo.KeepAlive 1.2
BackgroundJob {
    triggeredBy: BackgroundJob.Heartbeat
    minimumWait: 15
    onTriggered: { doWork(); finished() }
}
\`\`\`
`,

  notifications: `## Notifications

### nemo-notifications (recommended)
\`\`\`qml
import Nemo.Notifications 1.0

Notification {
    appName: "harbour-myapp"
    summary: qsTr("My Notification")
    body: qsTr("Something happened.")
    isTransient: true
}

// notification.publish()
// notification.close()
\`\`\`
`,

  covers: `## Cover Pages

\`\`\`qml
CoverPage {
    CoverBackground { anchors.fill: parent }

    Label { anchors.centerIn: parent; text: "My App" }

    CoverActionList {
        CoverAction {
            iconSource: "image://theme/icon-cover-play"
            onTriggered: player.play()
        }
    }
}
\`\`\`

- Up to 2 \`CoverAction\` items.
- No heavy animations — keep CPU usage minimal.
- Icons: \`image://theme/icon-cover-*\`.
`,

  sailfishsilica: `## Sailfish.Silica Tips

- List delegates must reflect \`highlighted\` state on colors.
- Add \`VerticalScrollDecorator {}\` to every SilicaListView/SilicaFlickable.
- Use \`RemorseItem\` for per-row destructive actions.
- Use \`RemorsePopup\` for global destructive actions.
- Use \`SectionHeader\` between logical groups.
`,

  general: `## General SailfishOS Development Tips

### SDK setup
1. Download Sailfish SDK: https://docs.sailfishos.org/Develop/SDK_Installation/
3. Set target: \`sfdk config target <name>\`
4. Build: \`sfdk cmake -B build -S . && sfdk cmake --build build && sfdk rpm\`

### Project structure
\`\`\`
harbour-myapp/
├── CMakeLists.txt
├── rpm/harbour-myapp.spec
├── src/main.cpp
├── qml/harbour-myapp.qml
│   ├── pages/
│   └── cover/
├── icons/86x86/ 108x108/ 128x128/ 172x172/
└── translations/
\`\`\`

### Resources
- Docs: https://docs.sailfishos.org
- Harbour FAQ: https://harbour.jolla.com/faq
- Silica reference: https://sailfishos.org/develop/docs/silica/
- Forum: https://forum.sailfishos.org
`,
};

// ─── Pitfalls ────────────────────────────────────────────────────────────────

const PITFALLS_MAP: Omit<Record<PitfallArea, string>, "all"> = {
  harbour: `## Common Harbour Submission Mistakes

❌ Binary doesn't start with \`harbour-\`
❌ Using private/internal Qt or Silica APIs
❌ Icon has rounded corners or shadows pre-applied
❌ Missing icon sizes (86, 108, 128, 172 px)
❌ Desktop file missing Name/Exec/Icon fields
❌ Requesting unnecessary permissions
❌ Hardcoded absolute paths — use \`SailfishApp::pathTo()\` or \`Qt.resolvedUrl()\`
❌ Using QtQuick.Controls — not whitelisted; use Sailfish.Silica
`,

  qml: `## Common QML Pitfalls

❌ Hardcoded pixel sizes — use \`Theme.fontSizeMedium\` etc.
❌ Hardcoded colors — use \`Theme.primaryColor\` etc.
❌ Using \`MouseArea\` instead of \`ListItem\`/\`BackgroundItem\`
❌ Missing \`VerticalScrollDecorator\` in SilicaListView/SilicaFlickable
❌ Blocking the main thread — use \`WorkerScript\` or C++ async
❌ Loading heavy data before \`PageStatus.Active\`
❌ Mixing \`anchors.fill\` with \`Column\` children — use \`width: parent.width\`
❌ Forgetting \`allowedOrientations\` on every Page
`,

  cpp: `## Common C++ Pitfalls

❌ Not using \`SailfishApp::main()\` — it sets up QML paths automatically
❌ Blocking the GUI thread — use QThread / QtConcurrent / QFuture
❌ Manually deleting QML-owned objects — let QML manage lifetime
❌ Missing \`Q_INVOKABLE\` or \`Q_PROPERTY\` NOTIFY signals on exposed types
❌ Wrong \`QStandardPaths\` location — use \`AppLocalDataLocation\` for private storage
`,

  cmake: `## Common CMake Pitfalls

❌ Running plain \`cmake\` instead of \`sfdk cmake\` — missing cross-compilation toolchain
❌ Forgetting \`set(CMAKE_AUTOMOC ON)\` — Q_OBJECT macros won't expand
❌ Not linking \`SAILFISHAPP_LIBRARIES\` via \`pkg_check_modules\`
❌ Not passing \`SAILFISHAPP_CFLAGS_OTHER\` to \`target_compile_options\`
❌ Setting \`CMAKE_INSTALL_PREFIX\` — sfdk/RPM sets it; override causes misinstalls
`,

  permissions: `## Common Permissions Pitfalls

❌ No \`[X-Sailjail]\` section in .desktop — app runs in a restricted sandbox
❌ Using \`Storage\` when \`ReadUserData\` is enough
❌ Missing \`OrganizationName\` / \`ApplicationName\` in [X-Sailjail]
❌ Requesting Camera/Mic permissions you never use — Harbour will reject
`,

  threading: `## Threading Pitfalls

❌ Updating QML properties from a non-GUI thread — use \`Qt::QueuedConnection\`
❌ Calling \`QThread::sleep()\` on the main thread — use \`QTimer\` instead
❌ Sharing non-thread-safe Qt objects across threads
`,

  storage: `## Storage Pitfalls

❌ Writing to the app install directory — it's read-only; use \`AppLocalDataLocation\`
❌ Missing \`QCoreApplication::setOrganizationName/setApplicationName\` before QSettings
❌ Not checking return values of QFile operations
❌ Storing large user files in private app data — use \`~/Downloads\` or media locations
`,
};

// ─── Snippets ─────────────────────────────────────────────────────────────────

type SnippetMap = Partial<Record<SnippetLanguage, string>>;

const SNIPPETS: Record<SnippetPattern, SnippetMap> = {
  "page-with-pulley": {
    qml: `import QtQuick 2.2
import Sailfish.Silica 1.0

Page {
    id: page
    allowedOrientations: Orientation.All

    SilicaFlickable {
        anchors.fill: parent
        contentHeight: column.height

        PullDownMenu {
            MenuItem {
                text: qsTr("Action")
                onClicked: doAction()
            }
        }

        Column {
            id: column
            width: page.width
            PageHeader { title: qsTr("My Page") }
            // Content here
        }

        VerticalScrollDecorator {}
    }
}`,
  },

  "list-view-delegate": {
    qml: `SilicaListView {
    id: listView
    anchors.fill: parent
    header: PageHeader { title: qsTr("Items") }
    model: myModel

    delegate: ListItem {
        id: delegate
        width: listView.width
        contentHeight: Theme.itemSizeMedium

        Row {
            anchors { left: parent.left; leftMargin: Theme.horizontalPageMargin; verticalCenter: parent.verticalCenter }
            spacing: Theme.paddingMedium

            Column {
                anchors.verticalCenter: parent.verticalCenter
                Label {
                    text: model.title
                    color: delegate.highlighted ? Theme.highlightColor : Theme.primaryColor
                }
                Label {
                    text: model.subtitle
                    font.pixelSize: Theme.fontSizeSmall
                    color: delegate.highlighted ? Theme.secondaryHighlightColor : Theme.secondaryColor
                }
            }
        }

        onClicked: pageStack.push(Qt.resolvedUrl("DetailPage.qml"), { item: model })
    }

    VerticalScrollDecorator {}
}`,
  },

  "cover-page": {
    qml: `import QtQuick 2.2
import Sailfish.Silica 1.0

CoverPage {
    id: cover
    property string statusText: "Idle"

    CoverBackground { anchors.fill: parent }

    Label {
        anchors.centerIn: parent
        text: cover.statusText
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
}`,
  },

  "settings-page": {
    qml: `import QtQuick 2.2
import Sailfish.Silica 1.0

Page {
    allowedOrientations: Orientation.All

    SilicaFlickable {
        anchors.fill: parent
        contentHeight: content.height

        Column {
            id: content
            width: parent.width

            PageHeader { title: qsTr("Settings") }
            SectionHeader { text: qsTr("General") }

            TextSwitch {
                text: qsTr("Option")
                description: qsTr("Enable this option")
                checked: false
                onCheckedChanged: settings.option = checked
            }

            Slider {
                width: parent.width
                label: qsTr("Volume")
                minimumValue: 0; maximumValue: 100; stepSize: 5
                valueText: value + "%"
                onReleased: settings.volume = value
            }
        }

        VerticalScrollDecorator {}
    }
}`,
  },

  "dbus-interface": {
    qml: `import QtDBus 2.2

DBusInterface {
    id: mpris
    service: "org.mpris.MediaPlayer2.myapp"
    path: "/org/mpris/MediaPlayer2"
    iface: "org.mpris.MediaPlayer2.Player"
    signalsEnabled: true

    function play()  { call("Play",  []) }
    function pause() { call("Pause", []) }

    function getPlaybackStatus(callback) {
        typedCall("Get", [
            { type: "s", value: "org.mpris.MediaPlayer2.Player" },
            { type: "s", value: "PlaybackStatus" }
        ], function(result) { callback(result) })
    }
}`,
    cpp: `#include <QtDBus/QDBusInterface>
#include <QtDBus/QDBusConnection>
#include <QtDBus/QDBusReply>

void MyClass::callDBusMethod()
{
    QDBusInterface iface(
        "org.freedesktop.Notifications",
        "/org/freedesktop/Notifications",
        "org.freedesktop.Notifications",
        QDBusConnection::sessionBus()
    );

    if (!iface.isValid()) {
        qWarning() << "D-Bus interface not valid:" << iface.lastError().message();
        return;
    }

    QDBusReply<uint> reply = iface.call(
        "Notify", "harbour-myapp", 0u, "",
        "Hello", "World", QStringList(), QVariantMap(), 5000
    );

    if (!reply.isValid())
        qWarning() << "D-Bus call failed:" << reply.error().message();
}`,
  },

  "background-service": {
    qml: `import Nemo.KeepAlive 1.2

BackgroundJob {
    id: bgJob
    triggeredBy: BackgroundJob.Heartbeat
    minimumWait: 15   // minutes

    onTriggered: {
        console.log("Background heartbeat at", new Date())
        syncData()
        finished()    // MUST call finished() to release the wakelock
    }
}`,
  },

  notification: {
    qml: `import Nemo.Notifications 1.0

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
// notification.close()`,
  },

  "file-picker": {
    qml: `import Sailfish.Pickers 1.0

Button {
    text: qsTr("Pick a file")
    onClicked: pageStack.push(filePickerPage)
}

Component {
    id: filePickerPage
    FilePickerPage {
        nameFilters: ["*.mp3", "*.ogg", "*.flac"]
        onSelectedContentPropertiesChanged: {
            var filePath = selectedContentProperties.filePath
            console.log("Selected:", filePath)
        }
    }
}`,
  },

  "share-picker": {
    qml: `Button {
    text: qsTr("Share")
    onClicked: {
        var share = Qt.createQmlObject('import Sailfish.Share 1.0; ShareAction {}', page)
        share.resources = [{
            "type": "text/plain",
            "status": 0,
            "name": qsTr("My content"),
            "data": "Hello from harbour-myapp!"
        }]
        share.trigger()
    }
}`,
  },

  "theme-aware-colors": {
    qml: `// Always follows the current ambience
Label { color: Theme.primaryColor }
Label { color: Theme.secondaryColor }
Label { color: Theme.highlightColor }

// Semi-transparent overlay
Rectangle {
    color: Theme.rgba(Theme.highlightBackgroundColor, Theme.highlightBackgroundOpacity)
}

// Detect dark vs light
Label {
    color: Theme.colorScheme === Theme.LightOnDark
           ? Theme.primaryColor
           : Theme.darkPrimaryColor
}`,
  },

  "keep-alive": {
    qml: `import Nemo.KeepAlive 1.2

// Prevent screen blanking while active
DisplayBlanking {
    preventBlanking: player.playbackState === Audio.PlayingState
}

// Periodic background heartbeat
BackgroundJob {
    triggeredBy: BackgroundJob.Heartbeat
    minimumWait: 30  // minutes
    onTriggered: { doPeriodicWork(); finished() }
}`,
  },

  "remorse-item": {
    qml: `SilicaListView {
    model: myModel
    delegate: ListItem {
        id: listItem
        width: parent.width

        Label { text: model.name; x: Theme.horizontalPageMargin; anchors.verticalCenter: parent.verticalCenter }

        menu: ContextMenu {
            MenuItem {
                text: qsTr("Delete")
                onClicked: remorseItem.execute(listItem, qsTr("Deleting"),
                               function() { myModel.remove(index) })
            }
        }

        RemorseItem { id: remorseItem }
    }
}`,
  },

  "section-header": {
    qml: `SilicaListView {
    model: sectionModel
    section.property: "category"
    section.delegate: SectionHeader { text: section }

    delegate: ListItem {
        Label {
            text: model.name
            x: Theme.horizontalPageMargin
            anchors.verticalCenter: parent.verticalCenter
        }
    }
}`,
  },

  "search-field": {
    qml: `SilicaListView {
    id: listView
    anchors.fill: parent

    header: Column {
        width: listView.width
        PageHeader { title: qsTr("Search") }
        SearchField {
            id: searchField
            width: parent.width
            placeholderText: qsTr("Search…")
            onTextChanged: filterModel.setFilterFixedString(text)
            Component.onCompleted: requestFocus()
        }
    }

    model: SortFilterProxyModel {
        id: filterModel
        sourceModel: myModel
        filterRole: "name"
        filterCaseSensitivity: Qt.CaseInsensitive
    }

    delegate: ListItem {
        Label { text: model.name; x: Theme.horizontalPageMargin; anchors.verticalCenter: parent.verticalCenter }
    }

    VerticalScrollDecorator {}
}`,
  },
};

// ─── Exports ─────────────────────────────────────────────────────────────────

export function getGuidelines(topic: GuidelineTopic): string {
  return GUIDELINES[topic] ?? `No guidelines found for topic: ${topic}`;
}

export function getPitfalls(area: PitfallArea): string {
  if (area === "all") {
    return Object.values(PITFALLS_MAP).join("\n---\n\n");
  }
  return PITFALLS_MAP[area] ?? `No pitfalls found for area: ${area}`;
}

export function getSnippet(pattern: SnippetPattern, language: SnippetLanguage): string {
  const snippetMap = SNIPPETS[pattern];
  if (!snippetMap) return `No snippet found for pattern: ${pattern}`;

  const code =
    snippetMap[language] ??
    snippetMap["qml"] ??
    Object.values(snippetMap).find(Boolean);

  if (!code) return `No ${language} snippet available for pattern: ${pattern}`;
  return `## ${pattern} (${language})\n\n\`\`\`${language}\n${code}\n\`\`\``;
}
