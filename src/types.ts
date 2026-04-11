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
