# SailfishOS Project & Feature Templates

Use these templates when creating or extending a SailfishOS project. Replace placeholders:
- `APPNAME` → full `harbour-*` name (e.g. `harbour-myapp`)
- `DISPLAY_NAME` → human-readable title
- `DESCRIPTION` → one-line description
- `ORG` → reverse-domain org prefix (e.g. `org.example`)
- `AUTHOR` → author full name
- `AUTHOR_EMAIL` → author email
- `LICENSE` → SPDX identifier (e.g. `MIT`, `GPL-3.0-or-later`)
- `REPO_URL` → source repo URL
- `YEAR` → current year

---

## Project Templates

### CMakeLists.txt (recommended)

```cmake
project(APPNAME CXX)
cmake_minimum_required(VERSION 3.5)

find_package(Qt5 COMPONENTS Core Network Qml Gui Quick REQUIRED)

include(FindPkgConfig)
pkg_search_module(SAILFISH sailfishapp REQUIRED)

set(CMAKE_AUTOMOC ON)
set(CMAKE_INCLUDE_CURRENT_DIR ON)

add_executable(APPNAME src/main.cpp)
target_compile_definitions(APPNAME PRIVATE
    $<$<OR:$<CONFIG:Debug>,$<CONFIG:RelWithDebInfo>>:QT_QML_DEBUG>
)
target_include_directories(APPNAME PRIVATE
    $<BUILD_INTERFACE:${SAILFISH_INCLUDE_DIRS}>
)
target_link_libraries(APPNAME
    Qt5::Quick
    ${SAILFISH_LDFLAGS}
)

install(TARGETS APPNAME RUNTIME DESTINATION bin)
install(DIRECTORY qml DESTINATION share/APPNAME)
install(DIRECTORY translations DESTINATION share/APPNAME FILES_MATCHING PATTERN "*.qm")
install(FILES APPNAME.desktop DESTINATION share/applications)
install(FILES icons/86x86/APPNAME.png   DESTINATION share/icons/hicolor/86x86/apps)
install(FILES icons/108x108/APPNAME.png DESTINATION share/icons/hicolor/108x108/apps)
install(FILES icons/128x128/APPNAME.png DESTINATION share/icons/hicolor/128x128/apps)
install(FILES icons/172x172/APPNAME.png DESTINATION share/icons/hicolor/172x172/apps)

FILE(GLOB TsFiles "translations/*.ts")
add_custom_target(distfiles
    SOURCES
        APPNAME.desktop
        qml/APPNAME.qml
        qml/cover/CoverPage.qml
        qml/pages/FirstPage.qml
        qml/pages/SecondPage.qml
        rpm/APPNAME.changes.in
        rpm/APPNAME.changes.run.in
        rpm/APPNAME.spec
        ${TsFiles})
```

### APPNAME.pro (qmake with C++)

```qmake
TARGET = APPNAME
CONFIG += sailfishapp

SOURCES += src/main.cpp

DISTFILES += qml/APPNAME.qml \
    qml/cover/CoverPage.qml \
    qml/pages/FirstPage.qml \
    qml/pages/SecondPage.qml \
    rpm/APPNAME.changes.in \
    rpm/APPNAME.changes.run.in \
    rpm/APPNAME.spec \
    translations/*.ts \
    APPNAME.desktop

SAILFISHAPP_ICONS = 86x86 108x108 128x128 172x172
CONFIG += sailfishapp_i18n
```

### APPNAME.pro (qmlOnly — no C++)

```qmake
TARGET = APPNAME
CONFIG += sailfishapp_qml

DISTFILES += qml/APPNAME.qml \
    qml/cover/CoverPage.qml \
    qml/pages/FirstPage.qml \
    qml/pages/SecondPage.qml \
    rpm/APPNAME.changes.in \
    rpm/APPNAME.changes.run.in \
    rpm/APPNAME.spec \
    translations/*.ts \
    APPNAME.desktop

SAILFISHAPP_ICONS = 86x86 108x108 128x128 172x172
CONFIG += sailfishapp_i18n
```

---

## Common Files (all templates)

### src/main.cpp

```cpp
#ifdef QT_QML_DEBUG
#include <QtQuick>
#endif

#include <sailfishapp.h>

int main(int argc, char *argv[])
{
    // SailfishApp::main() displays "qml/APPNAME.qml" automatically.
    // For more control, use SailfishApp::application(), createView(), pathTo().
    return SailfishApp::main(argc, argv);
}
```

### qml/APPNAME.qml

```qml
import QtQuick 2.0
import Sailfish.Silica 1.0
import "pages"

ApplicationWindow {
    initialPage: Component { FirstPage { } }
    cover: Qt.resolvedUrl("cover/CoverPage.qml")
    allowedOrientations: defaultAllowedOrientations
}
```

### qml/pages/FirstPage.qml

```qml
import QtQuick 2.0
import Sailfish.Silica 1.0

Page {
    id: page
    allowedOrientations: Orientation.All

    SilicaFlickable {
        anchors.fill: parent

        PullDownMenu {
            MenuItem {
                text: qsTr("Show Page 2")
                onClicked: pageStack.animatorPush(Qt.resolvedUrl("SecondPage.qml"))
            }
        }

        contentHeight: column.height

        Column {
            id: column
            width: page.width
            spacing: Theme.paddingLarge

            PageHeader { title: qsTr("DISPLAY_NAME") }

            Label {
                x: Theme.horizontalPageMargin
                text: qsTr("Hello Sailors")
                color: Theme.secondaryHighlightColor
                font.pixelSize: Theme.fontSizeExtraLarge
            }
        }
    }
}
```

### qml/pages/SecondPage.qml

```qml
import QtQuick 2.0
import Sailfish.Silica 1.0

Page {
    id: page
    allowedOrientations: Orientation.All

    SilicaListView {
        id: listView
        model: 20
        anchors.fill: parent

        header: PageHeader { title: qsTr("Nested Page") }

        delegate: BackgroundItem {
            id: delegate
            Label {
                x: Theme.horizontalPageMargin
                text: qsTr("Item") + " " + index
                anchors.verticalCenter: parent.verticalCenter
                color: delegate.highlighted ? Theme.highlightColor : Theme.primaryColor
            }
            onClicked: console.log("Clicked " + index)
        }

        VerticalScrollDecorator {}
    }
}
```

### qml/cover/CoverPage.qml

```qml
import QtQuick 2.0
import Sailfish.Silica 1.0

CoverBackground {
    Label {
        id: label
        anchors.centerIn: parent
        text: qsTr("My Cover")
    }

    CoverActionList {
        id: coverAction
        CoverAction { iconSource: "image://theme/icon-cover-next" }
        CoverAction { iconSource: "image://theme/icon-cover-pause" }
    }
}
```

### rpm/APPNAME.spec (cmake variant)

```spec
Name:       APPNAME

Summary:    DESCRIPTION
Version:    0.1
Release:    1
License:    LICENSE
URL:        REPO_URL
Source0:    %{name}-%{version}.tar.bz2
Requires:   sailfishsilica-qt5 >= 0.10.9
BuildRequires:  pkgconfig(sailfishapp) >= 1.0.2
BuildRequires:  pkgconfig(Qt5Core)
BuildRequires:  pkgconfig(Qt5Qml)
BuildRequires:  pkgconfig(Qt5Quick)
BuildRequires:  desktop-file-utils
BuildRequires:  cmake

%description
DESCRIPTION

%if 0%{?_chum}
Title: DISPLAY_NAME
Type: desktop-application
DeveloperName: AUTHOR
Categories:
 - Other
Custom:
  Repo: REPO_URL
Links:
  Homepage: REPO_URL
  Bugtracker: REPO_URL/issues
%endif


%prep
%setup -q -n %{name}-%{version}

%build
%cmake
%make_build

%install
%make_install

desktop-file-install --delete-original \
    --dir %{buildroot}%{_datadir}/applications \
    %{buildroot}%{_datadir}/applications/*.desktop

%files
%defattr(-,root,root,-)
%{_bindir}/%{name}
%{_datadir}/%{name}
%{_datadir}/applications/%{name}.desktop
%{_datadir}/icons/hicolor/*/apps/%{name}.png
```

### rpm/APPNAME.spec (qmake variant)

Same as cmake variant but replace the `%build` / `%install` sections:

```spec
%build
%qmake5
%make_build

%install
%qmake5_install
```

### rpm/APPNAME.spec (qmlOnly variant)

Same as qmake variant plus add to the preamble:
```spec
BuildArch:  noarch
Requires:   libsailfishapp-launcher
```

### rpm/APPNAME.changes.in

```
# Rename this file to APPNAME.changes to include it in the RPM.
# Add newest entries at the top.

* Sun Apr 13 2014 Jack Tar <jack.tar@example.com> 0.0.1-1
- Initial release
```

### rpm/APPNAME.changes.run.in

```bash
#!/bin/bash
# Rename this file to APPNAME.changes.run to auto-generate
# the changelog from git commit messages.
sfdk-changelog
```

### APPNAME.desktop

```ini
[Desktop Entry]
Type=Application
X-Nemo-Application-Type=silica-qt5
Icon=APPNAME
Exec=APPNAME
Name=DISPLAY_NAME

[X-Sailjail]
OrganizationName=ORG
ApplicationName=APPNAME
Permissions=
```

### translations/APPNAME.ts

```xml
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE TS>
<TS version="2.1">
<context>
    <name>FirstPage</name>
    <message>
        <source>Show Page 2</source>
        <translation type="unfinished"></translation>
    </message>
    <message>
        <source>DISPLAY_NAME</source>
        <translation type="unfinished"></translation>
    </message>
    <message>
        <source>Hello Sailors</source>
        <translation type="unfinished"></translation>
    </message>
</context>
</TS>
```

### .gitignore

```
\*~
.DS_Store
*.pro.user
*.pro.user.*
*.autosave
RPMS
build/
```

### .gitattributes

```
* text=auto eol=lf
```

---

## Feature Templates

### page — `qml/pages/NAMEPage.qml`

```qml
import QtQuick 2.2
import Sailfish.Silica 1.0

Page {
    id: page
    // property string itemId

    allowedOrientations: Orientation.All

    SilicaFlickable {
        anchors.fill: parent
        contentHeight: column.height

        PullDownMenu {
            MenuItem {
                text: qsTr("Action")
                onClicked: { /* TODO */ }
            }
        }

        Column {
            id: column
            width: page.width
            spacing: Theme.paddingMedium

            PageHeader { title: qsTr("NAME") }

            Label {
                x: Theme.horizontalPageMargin
                width: parent.width - 2 * Theme.horizontalPageMargin
                text: qsTr("Content goes here")
                color: Theme.primaryColor
                wrapMode: Text.WordWrap
            }
        }

        VerticalScrollDecorator {}
    }
}
```

Navigate to it:
```qml
pageStack.push(Qt.resolvedUrl("NAMEPage.qml"))
// or with properties:
pageStack.push(Qt.resolvedUrl("NAMEPage.qml"), { itemId: model.id })
```

### settings-page — `qml/pages/NAMESettingsPage.qml`

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
        }

        VerticalScrollDecorator {}
    }
}
```

### dbus-interface — `qml/dbus/NAMEInterface.qml`

```qml
import QtDBus 2.2

DBusInterface {
    id: root
    service: "org.example.NAME"
    path: "/org/example/NAME"
    iface: "org.example.NAME"
    signalsEnabled: true

    function doSomething() { call("DoSomething", []) }
}
```

### c++-backend — `src/NAME.h`

```cpp
#pragma once
#include <QObject>

class NAME : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QString status READ status NOTIFY statusChanged)

public:
    explicit NAME(QObject *parent = nullptr);

    QString status() const;

    Q_INVOKABLE void doSomething();

signals:
    void statusChanged();

private:
    QString m_status;
};
```

### c++-backend — `src/NAME.cpp`

```cpp
#include "NAME.h"
#include <QDebug>

NAME::NAME(QObject *parent)
    : QObject(parent)
    , m_status(QStringLiteral("idle"))
{
}

QString NAME::status() const { return m_status; }

void NAME::doSomething()
{
    // TODO: implement
    m_status = QStringLiteral("done");
    emit statusChanged();
}
```

Register in `main.cpp` before `SailfishApp::main()` (or in its application setup):
```cpp
#include "NAME.h"
// ...
qmlRegisterType<NAME>("org.example.harbour_myapp", 1, 0, "NAME");
// then in QML: import org.example.harbour_myapp 1.0
```

### background-service — systemd unit `rpm/APPNAME-daemon.service`

```ini
[Unit]
Description=APPNAME background daemon

[Service]
Type=simple
ExecStart=/usr/bin/APPNAME-daemon
Restart=on-failure

[Install]
WantedBy=sailfish-user-session.target
```

Install via RPM spec `%files` section:
```spec
%{_userunitdir}/APPNAME-daemon.service
```
