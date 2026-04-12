import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import type { ScaffoldOptions, TemplateContext, FileMap } from "./types.js";

type TemplateFn = (ctx: TemplateContext) => FileMap;

const TEMPLATES: Record<string, TemplateFn> = {
  qmlOnlyQmake: qmlOnlyQmakeTemplate,
  qmake: qmakeTemplate,
  cmake: cmakeTemplate,
};

// ─── Runtime default resolvers ───────────────────────────────────────────────

/**
 * Resolves the author name from (in priority order):
 *  1. The value provided by the caller
 *  2. `git config user.name`
 *  3. The USER / USERNAME / LOGNAME environment variable
 */
function resolveAuthorName(provided: string): string {
  if (provided) return provided;
  const git = spawnSync("git", ["config", "user.name"], { encoding: "utf8" });
  if (git.status === 0 && git.stdout.trim()) return git.stdout.trim();
  return process.env["USER"] ?? process.env["USERNAME"] ?? process.env["LOGNAME"] ?? "";
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export async function scaffoldProject(opts: ScaffoldOptions): Promise<string> {
  let { name } = opts;
  const {
    displayName,
    description,
    outputDir,
    template,
    organization,
    authorEmail,
    license,
    openSource,
    chumCategories,
    packageIconUrl,
    donationUrl,
  } = opts;

  // Resolve optional fields that can be auto-detected from the environment
  const authorName = resolveAuthorName(opts.authorName);
  const repoUrl = opts.repoUrl;

  if (!name.startsWith("harbour-") && !name.startsWith("sailfish-")) {
    name = `harbour-${name}`;
  }

  const projectDir = path.join(outputDir, name);
  if (fs.existsSync(projectDir)) {
    throw new Error(`Directory already exists: ${projectDir}`);
  }

  const ctx: TemplateContext = {
    name,
    displayName,
    description,
    outputDir,
    template,
    organization,
    authorName,
    authorEmail,
    license,
    openSource,
    repoUrl,
    chumCategories,
    packageIconUrl,
    donationUrl,
    year: new Date().getFullYear(),
    nameCapital: toPascalCase(name.replace(/^harbour-/, "")),
  };

  const templateFn = TEMPLATES[template];
  if (!templateFn) throw new Error(`Unknown template: ${template}`);

  const files: FileMap = { ...templateFn(ctx), ...commonFiles(ctx) };

  const createdFiles: string[] = [];
  for (const [relPath, content] of Object.entries(files)) {
    const absPath = path.join(projectDir, relPath);
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, content, "utf8");
    createdFiles.push(relPath);
  }

  return [
    `✅ Project created at ${projectDir}`,
    "",
    "Files created:",
    ...createdFiles.map((f) => `  ${f}`),
    "",
    "Next steps:",
    `  1. cd ${projectDir}`,
    "  2. sfdk config target <your-target>    # e.g. SailfishOS-4.5.0.18-armv7hl",
    "  3. sfdk cmake -B build -S .",
    "  4. sfdk cmake --build build",
    "  5. sfdk rpm",
  ].join("\n");
}

// ─── Common files (present in every project) ──────────────────────────────────

function commonFiles(ctx: TemplateContext): FileMap {
  return {
    [`rpm/${ctx.name}.changes.in`]: changelog(ctx),
    [`rpm/${ctx.name}.changes.run.in`]: changelogScript(ctx),
    [`qml/${ctx.name}.qml`]: mainPage(),
    "qml/pages/FirstPage.qml": firstPage(),
    "qml/pages/SecondPage.qml": secondPage(),
    "qml/cover/CoverPage.qml": coverPage(),
    [`translations/${ctx.name}.ts`]: translationFile(),
    [`${ctx.name}.desktop`]: desktopFile(ctx),
    ".gitignore": gitignore(),
    ".gitattributes": gitattributes(),
    "README.md": readme(ctx),
  };
}

// ─── Template: qmlOnlyQmake ──────────────────────────────────────────────────

function qmlOnlyQmakeTemplate(ctx: TemplateContext): FileMap {
  return {
    [`${ctx.name}.pro`]: qmake(ctx),
    [`rpm/${ctx.name}.spec`]: rpmQMLSpec(ctx),
  };
}

// ─── Template: qmake ─────────────────────────────────────────────────────────

function qmakeTemplate(ctx: TemplateContext): FileMap {
  return {
    [`${ctx.name}.pro`]: qmake(ctx),
    "src/main.cpp": mainCpp(ctx),
    [`rpm/${ctx.name}.spec`]: rpmSpec(ctx),
  };
}

// ─── Template: cmake ─────────────────────────────────────────────────────────

function cmakeTemplate(ctx: TemplateContext): FileMap {
  return {
    "CMakeLists.txt": cmakeLists(ctx),
    "src/main.cpp": mainCpp(ctx),
    [`rpm/${ctx.name}.spec`]: rpmCMakeSpec(ctx),
  };
}

// ─── Shared QML fragments ────────────────────────────────────────────────────

function mainPage(): string {
  return `import QtQuick 2.0
import Sailfish.Silica 1.0
import "pages"

ApplicationWindow {
    initialPage: Component { FirstPage { } }
    cover: Qt.resolvedUrl("cover/CoverPage.qml")
    allowedOrientations: defaultAllowedOrientations
}
`;
}

function firstPage(): string {
  return `import QtQuick 2.0
import Sailfish.Silica 1.0

Page {
    id: page

    // The effective value will be restricted by ApplicationWindow.allowedOrientations
    allowedOrientations: Orientation.All

    // To enable PullDownMenu, place our content in a SilicaFlickable
    SilicaFlickable {
        anchors.fill: parent

        // PullDownMenu and PushUpMenu must be declared in SilicaFlickable, SilicaListView or SilicaGridView
        PullDownMenu {
            MenuItem {
                text: qsTr("Show Page 2")
                onClicked: pageStack.animatorPush(Qt.resolvedUrl("SecondPage.qml"))
            }
        }

        // Tell SilicaFlickable the height of its content.
        contentHeight: column.height

        // Place our content in a Column.  The PageHeader is always placed at the top
        // of the page, followed by our content.
        Column {
            id: column

            width: page.width
            spacing: Theme.paddingLarge
            PageHeader {
                title: qsTr("UI Template")
            }
            Label {
                x: Theme.horizontalPageMargin
                text: qsTr("Hello Sailors")
                color: Theme.secondaryHighlightColor
                font.pixelSize: Theme.fontSizeExtraLarge
            }
        }
    }
}
`;
}

function secondPage(): string {
  return `import QtQuick 2.0
import Sailfish.Silica 1.0

Page {
    id: page

    // The effective value will be restricted by ApplicationWindow.allowedOrientations
    allowedOrientations: Orientation.All

    SilicaListView {
        id: listView
        model: 20
        anchors.fill: parent
        header: PageHeader {
            title: qsTr("Nested Page")
        }
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
`;
}

function coverPage(): string {
  return `import QtQuick 2.0
import Sailfish.Silica 1.0

CoverBackground {
    Label {
        id: label
        anchors.centerIn: parent
        text: qsTr("My Cover")
    }

    CoverActionList {
        id: coverAction

        CoverAction {
            iconSource: "image://theme/icon-cover-next"
        }

        CoverAction {
            iconSource: "image://theme/icon-cover-pause"
        }
    }
}
`;
}

// ─── QMake Project ───────────────────────────────────────────────────────────

function qmake(ctx: TemplateContext): string {
  return `# NOTICE:
#
# Application name defined in TARGET has a corresponding QML filename.
# If name defined in TARGET is changed, the following needs to be done
# to match new name:
#   - corresponding QML filename must be changed
#   - desktop icon filename must be changed
#   - desktop filename must be changed
#   - icon definition filename in desktop file must be changed
#   - translation filenames have to be changed

# The name of your application
TARGET = ${ctx.name}

CONFIG += sailfishapp

SOURCES += src/main.cpp

DISTFILES += qml/${ctx.name}.qml \
    qml/cover/CoverPage.qml \
    qml/pages/FirstPage.qml \
    qml/pages/SecondPage.qml \
    rpm/${ctx.name}.changes.in \
    rpm/${ctx.name}.changes.run.in \
    rpm/${ctx.name}.spec \
    translations/*.ts \
    ${ctx.name}.desktop

SAILFISHAPP_ICONS = 86x86 108x108 128x128 172x172

# to disable building translations every time, comment out the
# following CONFIG line
CONFIG += sailfishapp_i18n

# German translation was enabled as an example. If you aren't
# planning to localize your app, remember to comment out the
# following TRANSLATIONS line. And also do not forget to
# modify the localized app name in the the .desktop file.
#TRANSLATIONS += translations/${ctx.name}-de.ts
`;
}

// ─── QMake QML Project ───────────────────────────────────────────────────────

function qmakeQML(ctx: TemplateContext): string {
  return `# NOTICE:
#
# Application name defined in TARGET has a corresponding QML filename.
# If name defined in TARGET is changed, the following needs to be done
# to match new name:
#   - corresponding QML filename must be changed
#   - desktop icon filename must be changed
#   - desktop filename must be changed
#   - icon definition filename in desktop file must be changed
#   - translation filenames have to be changed

# The name of your application
TARGET = ${ctx.name}

CONFIG += sailfishapp_qml

DISTFILES += qml/${ctx.name}.qml \
    qml/cover/CoverPage.qml \
    qml/pages/FirstPage.qml \
    qml/pages/SecondPage.qml \
    rpm/${ctx.name}.changes.in \
    rpm/${ctx.name}.changes.run.in \
    rpm/${ctx.name}.spec \
    translations/*.ts \
    ${ctx.name}.desktop

SAILFISHAPP_ICONS = 86x86 108x108 128x128 172x172

# to disable building translations every time, comment out the
# following CONFIG line
CONFIG += sailfishapp_i18n

# German translation was enabled as an example. If you aren't
# planning to localize your app, remember to comment out the
# following TRANSLATIONS line. And also do not forget to
# modify the localized app name in the the .desktop file.
#TRANSLATIONS += translations/${ctx.name}-de.ts
`;
}
// ─── CMakeLists ──────────────────────────────────────────────────────────────

function cmakeLists(ctx: TemplateContext): string {
  return `project(${ctx.name} CXX)
cmake_minimum_required(VERSION 3.5)

find_package (Qt5 COMPONENTS Core Network Qml Gui Quick REQUIRED)

include(FindPkgConfig)
pkg_search_module(SAILFISH sailfishapp REQUIRED)

set(CMAKE_AUTOMOC ON)
set(CMAKE_INCLUDE_CURRENT_DIR ON)

add_executable(${ctx.name} src/main.cpp)
target_compile_definitions(${ctx.name} PRIVATE
    $<$<OR:$<CONFIG:Debug>,$<CONFIG:RelWithDebInfo>>:QT_QML_DEBUG>
)
target_include_directories(${ctx.name} PRIVATE
    $<BUILD_INTERFACE:
    \${SAILFISH_INCLUDE_DIRS}
>)
target_link_libraries(${ctx.name}
    Qt5::Quick
    \${SAILFISH_LDFLAGS}
)

install(TARGETS ${ctx.name}
    RUNTIME DESTINATION bin
)
install(DIRECTORY qml
    DESTINATION share/${ctx.name}
)
install(DIRECTORY translations
    DESTINATION share/${ctx.name}
    FILES_MATCHING PATTERN "*.qm"
)
install(FILES ${ctx.name}.desktop
    DESTINATION share/applications
)
install(FILES icons/86x86/${ctx.name}.png
    DESTINATION share/icons/hicolor/86x86/apps
)
install(FILES icons/108x108/${ctx.name}.png
    DESTINATION share/icons/hicolor/108x108/apps
)
install(FILES icons/128x128/${ctx.name}.png
    DESTINATION share/icons/hicolor/128x128/apps
)
install(FILES icons/172x172/${ctx.name}.png
    DESTINATION share/icons/hicolor/172x172/apps
)

# Get the other files reachable from the project tree in Qt Creator
FILE(GLOB TsFiles "translations/*.ts")
add_custom_target(distfiles
    SOURCES
        ${ctx.name}.desktop
        qml/${ctx.name}.qml
        qml/cover/CoverPage.qml
        qml/pages/FirstPage.qml
        qml/pages/SecondPage.qml
        rpm/${ctx.name}.changes.in
        rpm/${ctx.name}.changes.run.in
        rpm/${ctx.name}.spec
        rpm/${ctx.name}.yaml
        \${TsFiles})

# Tell Qt Creator where the application executable(s) would be located on the
# device.
#
# It is not necessary to list other deployables than executables (runtime
# targets) here. The deployment process of Sailfish OS projects is opaque to
# Qt Creator and the information contained in QtCreatorDeployment.txt is only
# used to locate the executable associated with the active run configuration
# on the device in order to run it.
#
# Search the Qt Creator Manual to learn about the QtCreatorDeployment.txt file
# format.
file(WRITE "\${CMAKE_BINARY_DIR}/QtCreatorDeployment.txt"
    "\${CMAKE_INSTALL_PREFIX}
\${CMAKE_BINARY_DIR}/${ctx.name}:bin
")
`;
}

// ─── Chum metadata block ─────────────────────────────────────────────────────

/**
 * Generates the SailfishOS:Chum metadata paragraph that must be the last
 * contiguous paragraph inside the %%description section of the RPM spec.
 *
 * Rules (from https://github.com/sailfishos-chum/main/blob/main/Metadata.md):
 *  - The %if … %endif block must contain NO empty or comment lines.
 *  - It must be the last paragraph of %%description.
 */
function chumBlock(ctx: TemplateContext): string {
  const lines: string[] = [
    "# SailfishOS:Chum metadata — https://github.com/sailfishos-chum/main/blob/main/Metadata.md",
    "%if 0%{?_chum}",
    `Title: ${ctx.displayName}`,
    "Type: desktop-application",
  ];

  if (ctx.authorName) {
    lines.push(`DeveloperName: ${ctx.authorName}`);
  }

  const cats = ctx.chumCategories?.length ? ctx.chumCategories : ["Other"];
  lines.push("Categories:");
  for (const cat of cats) {
    lines.push(` - ${cat}`);
  }

  // Custom sub-section (Repo must appear here; no blank lines allowed)
  if (ctx.repoUrl) {
    lines.push("Custom:");
    lines.push(`  Repo: ${ctx.repoUrl}`);
  }

  if (ctx.packageIconUrl) {
    lines.push(`PackageIcon: ${ctx.packageIconUrl}`);
  }

  // Links sub-section
  const homepage = ctx.repoUrl || `https://example.org/${ctx.name}`;
  lines.push("Links:");
  lines.push(`  Homepage: ${homepage}`);
  if (ctx.repoUrl) {
    lines.push(`  Bugtracker: ${ctx.repoUrl}/issues`);
    lines.push(`  Help: ${ctx.repoUrl}/discussions`);
  }
  if (ctx.donationUrl) {
    lines.push(`  Donation: ${ctx.donationUrl}`);
  }

  lines.push("%endif");

  return lines.join("\n");
}

/** Returns the %description section, appending a Chum block when openSource. */
function descriptionSection(ctx: TemplateContext): string {
  const body = `%description\n${ctx.description}`;
  if (!ctx.openSource) return body;
  // Blank line separates the human-readable description from the Chum block;
  // this is allowed — only empty lines *inside* %if…%endif are forbidden.
  return `${body}\n\n${chumBlock(ctx)}`;
}

/** Shared spec preamble fields that vary by context. */
function specPreamble(
  ctx: TemplateContext,
  extra: { buildArch?: string; extraRequires?: string[] } = {}
): string {
  const licenseField = ctx.license || "LICENSE";
  const urlField = ctx.repoUrl || "http://example.org/";
  const lines = [
    `Name:       ${ctx.name}`,
    "",
    `Summary:    ${ctx.description}`,
    "Version:    0.1",
    "Release:    1",
    `License:    ${licenseField}`,
  ];
  if (extra.buildArch) lines.push(`BuildArch:  ${extra.buildArch}`);
  lines.push(`URL:        ${urlField}`);
  lines.push("Source0:    %{name}-%{version}.tar.bz2");
  lines.push("Requires:   sailfishsilica-qt5 >= 0.10.9");
  for (const r of extra.extraRequires ?? []) lines.push(`Requires:   ${r}`);
  return lines.join("\n");
}

// ─── RPM spec ────────────────────────────────────────────────────────────────

function rpmSpec(ctx: TemplateContext): string {
  return `${specPreamble(ctx)}
BuildRequires:  pkgconfig(sailfishapp) >= 1.0.2
BuildRequires:  pkgconfig(Qt5Core)
BuildRequires:  pkgconfig(Qt5Qml)
BuildRequires:  pkgconfig(Qt5Quick)
BuildRequires:  desktop-file-utils

${descriptionSection(ctx)}


%prep
%setup -q -n %{name}-%{version}

%build

%qmake5 

%make_build


%install
%qmake5_install


desktop-file-install --delete-original         --dir %{buildroot}%{_datadir}/applications                %{buildroot}%{_datadir}/applications/*.desktop

%files
%defattr(-,root,root,-)
%{_bindir}/%{name}
%{_datadir}/%{name}
%{_datadir}/applications/%{name}.desktop
%{_datadir}/icons/hicolor/*/apps/%{name}.png
`;
}

// ─── RPM CMake spec ──────────────────────────────────────────────────────────

function rpmCMakeSpec(ctx: TemplateContext): string {
  return `${specPreamble(ctx)}
BuildRequires:  pkgconfig(sailfishapp) >= 1.0.2
BuildRequires:  pkgconfig(Qt5Core)
BuildRequires:  pkgconfig(Qt5Qml)
BuildRequires:  pkgconfig(Qt5Quick)
BuildRequires:  desktop-file-utils
BuildRequires:  cmake

${descriptionSection(ctx)}


%prep
%setup -q -n %{name}-%{version}

%build

%cmake

%make_build


%install
%make_install


desktop-file-install --delete-original         --dir %{buildroot}%{_datadir}/applications                %{buildroot}%{_datadir}/applications/*.desktop

%files
%defattr(-,root,root,-)
%{_bindir}/%{name}
%{_datadir}/%{name}
%{_datadir}/applications/%{name}.desktop
%{_datadir}/icons/hicolor/*/apps/%{name}.png
`;
}

// ─── RPM QML spec ────────────────────────────────────────────────────────────

function rpmQMLSpec(ctx: TemplateContext): string {
  return `${specPreamble(ctx, { buildArch: "noarch", extraRequires: ["libsailfishapp-launcher"] })}
BuildRequires:  pkgconfig(sailfishapp) >= 1.0.2
BuildRequires:  pkgconfig(Qt5Core)
BuildRequires:  pkgconfig(Qt5Qml)
BuildRequires:  pkgconfig(Qt5Quick)
BuildRequires:  desktop-file-utils

${descriptionSection(ctx)}


%prep
%setup -q -n %{name}-%{version}

%build

%qmake5 

%make_build


%install
%qmake5_install


desktop-file-install --delete-original         --dir %{buildroot}%{_datadir}/applications                %{buildroot}%{_datadir}/applications/*.desktop

%files
%defattr(-,root,root,-)
%{_datadir}/%{name}
%{_datadir}/applications/%{name}.desktop
%{_datadir}/icons/hicolor/*/apps/%{name}.png
`;
}

// ─── ChangeLog ───────────────────────────────────────────────────────────────

function changelog(ctx: TemplateContext): string {
  return `# Rename this file as ${ctx.name}.changes to include changelog
# entries in your RPM file.
#
# Add new changelog entries following the format below.
# Add newest entries to the top of the list.
# Separate entries from eachother with a blank line.
#
# Alternatively, if your changelog is automatically generated (e.g. with
# the git-change-log command provided with Sailfish OS SDK), create a
# ${ctx.name}.changes.run script to let mb2 run the required commands for you.

# * date ${ctx.authorName} ${ctx.authorEmail} version-release
# - Summary of changes

* Sun Apr 13 2014 Jack Tar <jack.tar@example.com> 0.0.1-1
- Scrubbed the deck
- Hoisted the sails
`;
}

// ─── ChangeLog Script ────────────────────────────────────────────────────────

function changelogScript(ctx: TemplateContext): string {
  return `#!/bin/bash
#
# Rename this file as ${ctx.name}.changes.run to let sfdk automatically
# generate changelog from well formatted Git commit messages and tag
# annotations. Note that 'sfdk changelog' must be invoked as 'sfdk-changelog' here.

sfdk-changelog

# Here are some basic examples how to change from the default behavior. Run
# 'sfdk --help-maintaining' to learn more.

# Use a subset of tags
#sfdk-changelog --tags refs/tags/my-prefix/*

# Group entries by minor revision, suppress headlines for patch-level revisions
#sfdk-changelog --dense '/[0-9]+.[0-9+$'

# Trim very old changes
#sfdk-changelog --since 2014-04-01
#echo '[ Some changelog entries trimmed for brevity ]'

# Use the subjects (first lines) of tag annotations when no entry would be
# included for a revision otherwise
#sfdk-changelog --auto-add-annotations
`;
}

// ─── main.cpp ────────────────────────────────────────────────────────────────

function mainCpp(ctx: TemplateContext): string {
  return `#ifdef QT_QML_DEBUG
#include <QtQuick>
#endif

#include <sailfishapp.h>

int main(int argc, char *argv[])
{
    // SailfishApp::main() will display "qml/${ctx.name}.qml", if you need more
    // control over initialization, you can use:
    //
    //   - SailfishApp::application(int, char *[]) to get the QGuiApplication *
    //   - SailfishApp::createView() to get a new QQuickView * instance
    //   - SailfishApp::pathTo(QString) to get a QUrl to a resource file
    //   - SailfishApp::pathToMainQml() to get a QUrl to the main QML file
    //
    // To display the view, call "show()" (will show fullscreen on device).

    return SailfishApp::main(argc, argv);
}
`;
}

// ─── Translation stub ────────────────────────────────────────────────────────

function translationFile(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE TS>
<TS version="2.1">
<context>
    <name>CoverPage</name>
    <message>
        <source>My Cover</source>
        <translation type="unfinished"></translation>
    </message>
</context>
<context>
    <name>FirstPage</name>
    <message>
        <source>Show Page 2</source>
        <translation type="unfinished"></translation>
    </message>
    <message>
        <source>UI Template</source>
        <translation type="unfinished"></translation>
    </message>
    <message>
        <source>Hello Sailors</source>
        <translation type="unfinished"></translation>
    </message>
</context>
<context>
    <name>SecondPage</name>
    <message>
        <source>Nested Page</source>
        <translation type="unfinished"></translation>
    </message>
    <message>
        <source>Item</source>
        <translation type="unfinished"></translation>
    </message>
</context>
</TS>
`;
}

// ─── Desktop file ────────────────────────────────────────────────────────────

function desktopFile(ctx: TemplateContext): string {
  return `[Desktop Entry]
Type=Application
X-Nemo-Application-Type=silica-qt5
Icon=${ctx.name}
Exec=${ctx.name}
Name=${ctx.name}
# translation example:
# your app name in German locale (de)
#
# Remember to comment out the following line, if you do not want to use
# a different app name in German locale (de).
#Name[de]=${ctx.name}

[X-Sailjail]
# Replace with your organization as a reverse domain name
OrganizationName=${ctx.organization}
# ApplicationName does not have to be identical to Name
ApplicationName=${ctx.name}
# Add the required permissions here
Permissions=
`;
}

// ─── .gitignore ──────────────────────────────────────────────────────────────

function gitignore(): string {
  return `*~
.DS_Store
*.pro.user
*.pro.user.*
*.autosave
RPMS
`;
}

// ─── .gitattributes ──────────────────────────────────────────────────────────

function gitattributes(): string {
  return `# Use target-compatible line endings as the safe default for cross compilation.
* text=auto eol=lf
`;
}

// ─── README ──────────────────────────────────────────────────────────────────

function readme(ctx: TemplateContext): string {
  return `# ${ctx.displayName}

${ctx.description}

## Building

Requires the [Sailfish SDK](https://docs.sailfishos.org/Tools/Sailfish_SDK/Installation/).

\`\`\`bash
sfdk config target <target>           # e.g. SailfishOS-4.5.0.18-armv7hl
sfdk cmake -B build -S .
sfdk cmake --build build
sfdk rpm
\`\`\`

## Deploying

\`\`\`bash
sfdk device list
sfdk config device "<your-device>"
sfdk deploy --sdk
\`\`\`

## License

MIT
`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}
