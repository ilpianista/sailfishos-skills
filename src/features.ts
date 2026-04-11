import fs from "fs";
import path from "path";
import type { AddFeatureOptions, FeatureResult, FileMap } from "./types.js";

type FeatureGenerator = (opts: { projectDir: string; name: string }) => FeatureResult;

const GENERATORS: Record<string, FeatureGenerator> = {
  page: generatePage,
  "cover-page": generateCoverPage,
  "settings-page": generateSettingsPage,
  "dbus-interface": generateDbusInterface,
  "background-service": generateBackgroundService,
  "c++-backend": generateCppBackend,
};

export async function addFeature(opts: AddFeatureOptions): Promise<string> {
  const { projectDir, feature, name } = opts;

  if (!fs.existsSync(projectDir)) {
    throw new Error(`Project directory not found: ${projectDir}`);
  }

  const gen = GENERATORS[feature];
  if (!gen) throw new Error(`Unknown feature: ${feature}`);

  const result = gen({ projectDir, name });
  const created: string[] = [];

  for (const [relPath, content] of Object.entries(result.files)) {
    const absPath = path.join(projectDir, relPath);
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    if (fs.existsSync(absPath)) {
      throw new Error(`File already exists: ${absPath}. Remove or rename it first.`);
    }
    fs.writeFileSync(absPath, content, "utf8");
    created.push(relPath);
  }

  return [
    `✅ Feature "${feature}" (${name}) added to ${projectDir}`,
    "",
    "Files created:",
    ...created.map((f) => `  ${f}`),
    "",
    ...(result.instructions ?? []),
  ].join("\n");
}

// ─── Page ────────────────────────────────────────────────────────────────────

function generatePage({ name }: { projectDir: string; name: string }): FeatureResult {
  const fileName = name.endsWith("Page") ? name : `${name}Page`;
  const files: FileMap = {
    [`qml/pages/${fileName}.qml`]: `import QtQuick 2.2
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

            PageHeader { title: qsTr("${name}") }

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
`,
  };

  return {
    files,
    instructions: [
      "To navigate to this page:",
      `  pageStack.push(Qt.resolvedUrl("${fileName}.qml"))`,
      "",
      "To pass data:",
      `  pageStack.push(Qt.resolvedUrl("${fileName}.qml"), { itemId: "abc" })`,
    ],
  };
}

// ─── Cover page ──────────────────────────────────────────────────────────────

function generateCoverPage({ name }: { projectDir: string; name: string }): FeatureResult {
  return {
    files: {
      [`qml/cover/${name}.qml`]: `import QtQuick 2.2
import Sailfish.Silica 1.0

CoverPage {
    id: cover

    CoverBackground { anchors.fill: parent }

    Label {
        anchors.centerIn: parent
        text: qsTr("${name}")
        color: Theme.primaryColor
        font.pixelSize: Theme.fontSizeMedium
        horizontalAlignment: Text.AlignHCenter
    }

    CoverActionList {
        CoverAction {
            iconSource: "image://theme/icon-cover-play"
            onTriggered: { /* primary cover action */ }
        }
    }
}
`,
    },
    instructions: [
      "Set this as the app cover in your ApplicationWindow:",
      `  cover: Qt.resolvedUrl("cover/${name}.qml")`,
    ],
  };
}

// ─── Settings page ───────────────────────────────────────────────────────────

function generateSettingsPage({ name }: { projectDir: string; name: string }): FeatureResult {
  return {
    files: {
      [`qml/pages/${name}.qml`]: `import QtQuick 2.2
import Sailfish.Silica 1.0

Page {
    id: page
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
                onCheckedChanged: { /* persist */ }
            }

            ComboBox {
                label: qsTr("Mode")
                menu: ContextMenu {
                    MenuItem { text: qsTr("Option A") }
                    MenuItem { text: qsTr("Option B") }
                }
            }

            SectionHeader { text: qsTr("Advanced") }

            Slider {
                width: parent.width
                label: qsTr("Value")
                minimumValue: 0; maximumValue: 100; stepSize: 1; value: 50
                valueText: value
                onReleased: { /* persist */ }
            }

            Button {
                anchors.horizontalCenter: parent.horizontalCenter
                text: qsTr("Reset")
                onClicked: remorsePopup.execute(qsTr("Resetting"), function() { /* reset */ })
            }

            RemorsePopup { id: remorsePopup }
        }

        VerticalScrollDecorator {}
    }
}
`,
    },
    instructions: [],
  };
}

// ─── D-Bus interface ─────────────────────────────────────────────────────────

function generateDbusInterface({ projectDir, name }: { projectDir: string; name: string }): FeatureResult {
  const appName = path.basename(projectDir);
  const safeName = appName.replace(/-/g, "_");
  return {
    files: {
      [`qml/dbus/${name}.qml`]: `import QtDBus 2.2

DBusInterface {
    id: root
    service: "org.example.${safeName}"
    path: "/org/example/${safeName}"
    iface: "org.example.${safeName}"
    signalsEnabled: false

    function exampleCall(arg1) {
        call("ExampleMethod", [arg1])
    }

    function exampleCallWithReturn(arg1, callback) {
        typedCall("ExampleMethodWithReturn",
                  [{ type: "s", value: arg1 }],
                  function(result) { callback(result) })
    }
}
`,
      [`dbus/org.example.${safeName}.service`]: `[D-BUS Service]
Name=org.example.${safeName}
Exec=/usr/bin/${appName}
`,
    },
    instructions: [
      "Add the service file to your CMakeLists.txt install:",
      `  install(FILES dbus/org.example.${safeName}.service`,
      `          DESTINATION share/dbus-1/services)`,
      "",
      "Add to RPM spec %files:",
      `  %{_datadir}/dbus-1/services/org.example.${safeName}.service`,
    ],
  };
}

// ─── Background service ──────────────────────────────────────────────────────

function generateBackgroundService({ projectDir, name }: { projectDir: string; name: string }): FeatureResult {
  const appName = path.basename(projectDir);
  const serviceName = `${appName}-${name.toLowerCase()}`;
  return {
    files: {
      [`systemd/${serviceName}.service`]: `[Unit]
Description=${name} background service for ${appName}
After=sailfish-user-session.target

[Service]
Type=simple
ExecStart=/usr/bin/${appName} --service
Restart=on-failure
RestartSec=5

[Install]
WantedBy=sailfish-user-session.target
`,
      [`src/${name}Service.h`]: `#pragma once
#include <QObject>

class ${name}Service : public QObject
{
    Q_OBJECT
public:
    explicit ${name}Service(QObject *parent = nullptr);
    ~${name}Service();

public slots:
    void doWork();

signals:
    void workCompleted();
};
`,
      [`src/${name}Service.cpp`]: `#include "${name}Service.h"
#include <QDebug>

${name}Service::${name}Service(QObject *parent) : QObject(parent)
{
    qDebug() << "[${name}Service] Started";
}

${name}Service::~${name}Service()
{
    qDebug() << "[${name}Service] Stopping";
}

void ${name}Service::doWork()
{
    // Background work goes here
    emit workCompleted();
}
`,
    },
    instructions: [
      "Add sources to CMakeLists.txt:",
      `  set(SRC_FILES src/main.cpp src/${name}Service.cpp)`,
      "",
      "Install the systemd service:",
      `  install(FILES systemd/${serviceName}.service DESTINATION lib/systemd/user)`,
      "",
      "Enable in RPM %post:",
      "  systemctl-user daemon-reload || :",
      `  systemctl-user enable ${serviceName}.service || :`,
    ],
  };
}

// ─── C++ backend ─────────────────────────────────────────────────────────────

function generateCppBackend({ name }: { projectDir: string; name: string }): FeatureResult {
  const ctxProp = name.charAt(0).toLowerCase() + name.slice(1);
  return {
    files: {
      [`src/${name}.h`]: `#pragma once
#include <QObject>
#include <QString>

class ${name} : public QObject
{
    Q_OBJECT
    Q_PROPERTY(int value READ value WRITE setValue NOTIFY valueChanged)

public:
    explicit ${name}(QObject *parent = nullptr);

    int value() const;
    void setValue(int newValue);

    Q_INVOKABLE void doAction(const QString &param);

signals:
    void valueChanged();
    void actionCompleted(const QString &result);

private:
    int m_value{0};
};
`,
      [`src/${name}.cpp`]: `#include "${name}.h"
#include <QDebug>

${name}::${name}(QObject *parent) : QObject(parent) {}

int ${name}::value() const { return m_value; }

void ${name}::setValue(int newValue)
{
    if (m_value == newValue) return;
    m_value = newValue;
    emit valueChanged();
}

void ${name}::doAction(const QString &param)
{
    qDebug() << "[${name}::doAction]" << param;
    emit actionCompleted(param);
}
`,
    },
    instructions: [
      "Register with QML in main.cpp:",
      "",
      `  #include "${name}.h"`,
      "  #include <QQmlContext>",
      "",
      "  auto *app  = SailfishApp::application(argc, argv);",
      "  auto *view = SailfishApp::createView();",
      `  ${name} backend;`,
      `  view->rootContext()->setContextProperty("${ctxProp}", &backend);`,
      "  view->setSource(SailfishApp::pathTo(\"qml/harbour-myapp.qml\"));",
      "  view->show();",
      "  return app->exec();",
      "",
      "Add to CMakeLists.txt:",
      `  set(SRC_FILES src/main.cpp src/${name}.cpp)`,
      "",
      "Use in QML:",
      `  ${ctxProp}.value`,
      `  ${ctxProp}.doAction("hello")`,
    ],
  };
}
