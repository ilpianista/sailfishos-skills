export type ProjectTemplate = "basic" | "list-view" | "map" | "media-player" | "settings-app";

export type GuidelineTopic =
  | "harbour-validation"
  | "ui-components"
  | "navigation"
  | "theming"
  | "permissions"
  | "dbus"
  | "background-services"
  | "notifications"
  | "covers"
  | "sailfishsilica"
  | "general"
  | "ux-guidelines";

export type PitfallArea =
  | "harbour"
  | "qml"
  | "cpp"
  | "cmake"
  | "permissions"
  | "threading"
  | "storage"
  | "all";

export type SnippetPattern =
  | "page-with-pulley"
  | "list-view-delegate"
  | "cover-page"
  | "settings-page"
  | "dbus-interface"
  | "background-service"
  | "notification"
  | "file-picker"
  | "share-picker"
  | "theme-aware-colors"
  | "keep-alive"
  | "remorse-item"
  | "section-header"
  | "search-field";

export type SnippetLanguage = "qml" | "cpp" | "cmake";

export type FeatureKind =
  | "page"
  | "cover-page"
  | "settings-page"
  | "dbus-interface"
  | "background-service"
  | "c++-backend";

// ─── Scaffold ─────────────────────────────────────────────────────────────────

export interface ScaffoldOptions {
  name: string;
  displayName: string;
  description: string;
  outputDir: string;
  template: ProjectTemplate;
  organization: string;
  authorName: string;
  authorEmail: string;
  /** SPDX license identifier, e.g. "MIT", "GPL-3.0-or-later". Defaults to "LICENSE" placeholder. */
  license: string;
  /**
   * Mark the project as open source. When true, a SailfishOS:Chum metadata
   * block is embedded in the RPM spec's %%description section.
   * See https://github.com/sailfishos-chum/main/blob/main/Metadata.md
   */
  openSource: boolean;
  /** Source-code repository URL, e.g. "https://github.com/user/harbour-myapp". Used for Chum metadata and the spec URL field. */
  repoUrl: string;
  /**
   * AppStream categories for the Chum listing.
   * See https://specifications.freedesktop.org/menu-spec/latest/category-registry.html
   * Defaults to ["Other"] when omitted.
   */
  chumCategories: string[];
  /** URL to a package icon image (SVG preferred) for the Chum GUI. */
  packageIconUrl: string;
  /** Donation page URL shown in the Chum GUI. */
  donationUrl: string;
}

/** Internal context passed to template generators */
export interface TemplateContext extends ScaffoldOptions {
  year: number;
  /** PascalCase version of the app name without the harbour- prefix */
  nameCapital: string;
}

/** Map of relative file path → file content */
export type FileMap = Record<string, string>;

// ─── Build ────────────────────────────────────────────────────────────────────

export interface BuildOptions {
  projectDir: string;
  target: string;
  outputDir: string;
  verbose: boolean;
}

export interface CleanOptions {
  projectDir: string;
}

export interface DeployOptions {
  projectDir: string;
  device: string;
}

// ─── Chum ─────────────────────────────────────────────────────────────────────

export interface AddChumMetadataOptions {
  projectDir: string;
  /** Override the author name; auto-detected from `git config user.name` if omitted. */
  authorName: string;
  /**
   * AppStream categories. Defaults to ["Other"].
   * See https://specifications.freedesktop.org/menu-spec/latest/category-registry.html
   */
  categories: string[];
  /** Override the package icon URL; auto-derived from the git remote + local icons/ directory if omitted. */
  packageIconUrl: string;
  /** Optional donation page URL. */
  donationUrl: string;
}

// ─── Features ─────────────────────────────────────────────────────────────────

export interface AddFeatureOptions {
  projectDir: string;
  feature: FeatureKind;
  name: string;
}

export interface FeatureResult {
  files: FileMap;
  instructions: string[];
}
