#!/usr/bin/env node
/**
 * SailfishOS MCP Server for OpenCode
 * Provides tools for bootstrapping, building, and guiding SailfishOS app development.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { scaffoldProject } from "./scaffold.js";
import { buildProject, cleanProject, deployProject } from "./build.js";
import { getGuidelines, getPitfalls, getSnippet } from "./guidelines.js";
import { addFeature } from "./features.js";
import { addChumMetadata } from "./chum.js";

const server = new McpServer({
  name: "sailfishos-dev",
  version: "1.0.0",
});

// ─── SCAFFOLD ────────────────────────────────────────────────────────────────

server.tool(
  "sailfish_create_project",
  "Bootstrap a new SailfishOS application project with correct structure, RPM spec, and QML scaffolding.",
  {
    name: z.string().describe("Application name, e.g. harbour-myapp"),
    displayName: z.string().describe("Human-readable display name"),
    description: z.string().describe("Short description of the app"),
    outputDir: z.string().describe("Directory where the project will be created"),
    template: z
      .enum(["basic", "list-view", "map", "media-player", "settings-app"])
      .default("basic")
      .describe("Project template to use"),
    organization: z
      .string()
      .default("org.example")
      .describe("Reverse-domain organization prefix"),
    authorName: z
      .string()
      .default("")
      .describe(
        "Your full name for the RPM spec and changelog, e.g. Jane Dev. " +
          "Auto-detected from `git config user.name` or the USER environment variable if omitted."
      ),
    authorEmail: z.string().default("").describe("Author email for the spec file"),
    license: z
      .string()
      .default("LICENSE")
      .describe(
        "SPDX license identifier used in the RPM spec License: field, e.g. MIT, GPL-3.0-or-later, BSD-3-Clause. " +
          "Defaults to the placeholder 'LICENSE' — set a real identifier for open-source projects."
      ),
    openSource: z
      .boolean()
      .default(true)
      .describe(
        "When true, embed SailfishOS:Chum metadata in the RPM spec %%description so the app can be " +
          "submitted to the Chum community repository (https://github.com/sailfishos-chum/main)."
      ),
    repoUrl: z
      .string()
      .default("")
      .describe(
        "Source-code repository URL, e.g. https://github.com/user/harbour-myapp. " +
          "Auto-detected from `git remote get-url origin` in the output directory if omitted. " +
          "Used as the RPM spec URL: field and as the Chum Repo / Homepage / Bugtracker base URL."
      ),
    chumCategories: z
      .array(z.string())
      .default([])
      .describe(
        "AppStream categories for the Chum listing. " +
          "See https://specifications.freedesktop.org/menu-spec/latest/category-registry.html. " +
          "Examples: [\"Network\"], [\"Multimedia\", \"Audio\"]. Defaults to [\"Other\"] when empty."
      ),
    packageIconUrl: z
      .string()
      .default("")
      .describe(
        "URL to a package icon image (SVG preferred, 172×172 px PNG as fallback) " +
          "shown in the Chum GUI application. Leave empty to omit."
      ),
    donationUrl: z
      .string()
      .default("")
      .describe("URL to a donation page shown in the Chum GUI. Leave empty to omit."),
  },
  async (args) => {
    try {
      const result = await scaffoldProject({
        ...args,
        license: args.license ?? "LICENSE",
        openSource: args.openSource ?? false,
        repoUrl: args.repoUrl ?? "",
        chumCategories: args.chumCategories ?? [],
        packageIconUrl: args.packageIconUrl ?? "",
        donationUrl: args.donationUrl ?? "",
      });
      return { content: [{ type: "text", text: result }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }
);

// ─── BUILD ───────────────────────────────────────────────────────────────────

server.tool(
  "sailfish_build",
  "Build a SailfishOS project using the sfdk CLI (Sailfish SDK). Produces an RPM package.",
  {
    projectDir: z
      .string()
      .describe("Absolute path to the project root (where the .spec file lives)"),
    target: z
      .string()
      .default("")
      .describe(
        "SDK build target, e.g. SailfishOS-4.5.0.18-armv7hl. Leave empty to use the active target."
      ),
    outputDir: z
      .string()
      .default("")
      .describe("Where to copy the resulting RPM. Defaults to projectDir/RPMS."),
    verbose: z.boolean().default(false).describe("Show full build output"),
  },
  async (args) => {
    try {
      const result = await buildProject(args);
      return { content: [{ type: "text", text: result }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Build failed: ${message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "sailfish_clean",
  "Run `sfdk cmake --build . --target clean` inside the build directory.",
  {
    projectDir: z.string().describe("Absolute path to the project root"),
  },
  async (args) => {
    try {
      const result = await cleanProject(args);
      return { content: [{ type: "text", text: result }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Clean failed: ${message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "sailfish_deploy",
  "Deploy an already-built RPM to a connected device or emulator via sfdk.",
  {
    projectDir: z.string().describe("Absolute path to the project root"),
    device: z
      .string()
      .default("")
      .describe("sfdk device name. Leave empty to use the currently active device."),
  },
  async (args) => {
    try {
      const result = await deployProject(args);
      return { content: [{ type: "text", text: result }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Deploy failed: ${message}` }],
        isError: true,
      };
    }
  }
);

// ─── GUIDELINES ──────────────────────────────────────────────────────────────

server.tool(
  "sailfish_guidelines",
  "Return curated SailfishOS UI/UX and technical guidelines for a given topic.",
  {
    topic: z
      .enum([
        "harbour-validation",
        "ui-components",
        "navigation",
        "theming",
        "permissions",
        "dbus",
        "background-services",
        "notifications",
        "covers",
        "sailfishsilica",
        "general",
      ])
      .describe("Topic area to retrieve guidelines for"),
  },
  async ({ topic }) => {
    const text = getGuidelines(topic);
    return { content: [{ type: "text", text }] };
  }
);

server.tool(
  "sailfish_pitfalls",
  "List common mistakes and anti-patterns for a specific SailfishOS development area.",
  {
    area: z
      .enum(["harbour", "qml", "cpp", "cmake", "permissions", "threading", "storage", "all"])
      .default("all")
      .describe("Development area to check pitfalls for"),
  },
  async ({ area }) => {
    const text = getPitfalls(area);
    return { content: [{ type: "text", text }] };
  }
);

server.tool(
  "sailfish_snippet",
  "Return a ready-to-use code snippet for a common SailfishOS pattern.",
  {
    pattern: z
      .enum([
        "page-with-pulley",
        "list-view-delegate",
        "cover-page",
        "settings-page",
        "dbus-interface",
        "background-service",
        "notification",
        "file-picker",
        "share-picker",
        "theme-aware-colors",
        "keep-alive",
        "remorse-item",
        "section-header",
        "search-field",
      ])
      .describe("Pattern to generate a snippet for"),
    language: z
      .enum(["qml", "cpp", "cmake"])
      .default("qml")
      .describe("Target language for the snippet"),
  },
  async ({ pattern, language }) => {
    const text = getSnippet(pattern, language);
    return { content: [{ type: "text", text }] };
  }
);

// ─── ADD FEATURE ─────────────────────────────────────────────────────────────

server.tool(
  "sailfish_add_feature",
  "Add a new feature (page, cover, service, D-Bus interface, etc.) to an existing SailfishOS project.",
  {
    projectDir: z.string().describe("Absolute path to the project root"),
    feature: z
      .enum([
        "page",
        "cover-page",
        "settings-page",
        "dbus-interface",
        "background-service",
        "c++-backend",
      ])
      .describe("Type of feature to add"),
    name: z
      .string()
      .describe("Name for the new feature, e.g. DetailPage or MusicService"),
  },
  async (args) => {
    try {
      const result = await addFeature(args);
      return { content: [{ type: "text", text: result }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }
);

// ─── CHUM METADATA ───────────────────────────────────────────────────────────

server.tool(
  "sailfish_add_chum_metadata",
  [
    "Inject SailfishOS:Chum metadata into the RPM spec of an existing project.",
    "Reads the License field and app name from the spec, the repository URL and",
    "author name from git, and the icon URL from the local icons/ directory.",
    "All values can be overridden. The metadata block is appended as the last",
    "paragraph of %description, wrapped in %if 0%{?_chum} … %endif.",
  ].join(" "),
  {
    projectDir: z
      .string()
      .describe("Absolute path to the existing SailfishOS project root"),
    categories: z
      .array(z.string())
      .default([])
      .describe(
        "AppStream categories for the Chum listing. " +
          "See https://specifications.freedesktop.org/menu-spec/latest/category-registry.html. " +
          "Examples: [\"Network\"], [\"Multimedia\", \"Audio\"]. Defaults to [\"Other\"]."
      ),
    authorName: z
      .string()
      .default("")
      .describe(
        "Override the developer name shown in Chum. " +
          "Auto-detected from `git config user.name` inside projectDir if omitted."
      ),
    packageIconUrl: z
      .string()
      .default("")
      .describe(
        "Override the package icon URL. " +
          "Auto-derived from the git remote + local icons/ directory if omitted " +
          "(e.g. https://raw.githubusercontent.com/user/harbour-foo/master/icons/harbour-foo.svg)."
      ),
    donationUrl: z
      .string()
      .default("")
      .describe("Optional donation page URL shown in the Chum GUI."),
  },
  async (args) => {
    try {
      const result = await addChumMetadata(args);
      return { content: [{ type: "text", text: result }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }
);

// ─── TRANSPORT ───────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
