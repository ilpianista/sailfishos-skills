# SailfishOS Code Snippets

Ready-to-use patterns for common SailfishOS development tasks.

## page-with-pulley

```qml
import QtQuick 2.2
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
}
```

---

## list-view-delegate

```qml
SilicaListView {
    id: listView
    anchors.fill: parent
    header: PageHeader { title: qsTr("Items") }
    model: myModel

    delegate: ListItem {
        id: delegate
        width: listView.width
        contentHeight: Theme.itemSizeMedium

        Row {
            anchors {
                left: parent.left
                leftMargin: Theme.horizontalPageMargin
                verticalCenter: parent.verticalCenter
            }
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
}
```

---

## cover-page

```qml
import QtQuick 2.2
import Sailfish.Silica 1.0

CoverBackground {
    id: cover
    property string statusText: "Idle"

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
}
```

---

## settings-page

```qml
import QtQuick 2.2
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
                minimumValue: 0
                maximumValue: 100
                stepSize: 5
                valueText: value + "%"
                onReleased: settings.volume = value
            }
        }

        VerticalScrollDecorator {}
    }
}
```

---

## dbus-interface (QML)

```qml
import QtDBus 2.2

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
}
```

## dbus-interface (C++)

```cpp
#include <QtDBus/QDBusInterface>
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
}
```

---

## background-service

```qml
import Nemo.KeepAlive 1.2

BackgroundJob {
    id: bgJob
    triggeredBy: BackgroundJob.Heartbeat
    minimumWait: 15   // minutes

    onTriggered: {
        console.log("Background heartbeat at", new Date())
        syncData()
        finished()    // MUST call finished() to release the wakelock
    }
}
```

---

## notification

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

## file-picker

```qml
import Sailfish.Pickers 1.0

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
}
```

---

## share-picker

```qml
Button {
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
}
```

---

## theme-aware-colors

```qml
// Always follows the current ambience
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
}
```

---

## keep-alive

```qml
import Nemo.KeepAlive 1.2

// Prevent screen blanking while active
DisplayBlanking {
    preventBlanking: player.playbackState === Audio.PlayingState
}

// Periodic background heartbeat
BackgroundJob {
    triggeredBy: BackgroundJob.Heartbeat
    minimumWait: 30  // minutes
    onTriggered: { doPeriodicWork(); finished() }
}
```

---

## remorse-item

```qml
SilicaListView {
    model: myModel
    delegate: ListItem {
        id: listItem
        width: parent.width

        Label {
            text: model.name
            x: Theme.horizontalPageMargin
            anchors.verticalCenter: parent.verticalCenter
        }

        menu: ContextMenu {
            MenuItem {
                text: qsTr("Delete")
                onClicked: remorseItem.execute(listItem, qsTr("Deleting"),
                               function() { myModel.remove(index) })
            }
        }

        RemorseItem { id: remorseItem }
    }
}
```

---

## section-header

```qml
SilicaListView {
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
}
```

---

## search-field

```qml
SilicaListView {
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
        Label {
            text: model.name
            x: Theme.horizontalPageMargin
            anchors.verticalCenter: parent.verticalCenter
        }
    }

    VerticalScrollDecorator {}
}
```
