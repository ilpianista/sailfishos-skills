import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import type { AddChumMetadataOptions } from "./types.js";

// ─── Entry point ─────────────────────────────────────────────────────────────

export async function addChumMetadata(opts: AddChumMetadataOptions): Promise<string> {
  const { projectDir, categories, donationUrl } = opts;

  if (!fs.existsSync(projectDir)) {
    throw new Error(`Project directory not found: ${projectDir}`);
  }

  // 1. Locate and read the spec file
  const specPath = findSpecFile(projectDir);
  const specContent = fs.readFileSync(specPath, "utf8");

  // 2. Guard: bail out if a Chum block is already present
  if (/%if\s+0%\{\?_chum\}/.test(specContent)) {
    throw new Error(
      `A Chum metadata block already exists in ${path.relative(projectDir, specPath)}.\n` +
        "Edit it manually or remove it first."
    );
  }

  // 3. Parse the fields we need from the spec
  const spec = parseSpec(specContent);

  // 4. Gather git-derived values from the project directory (which exists)
  const resolvedRepoUrl = gitRemoteUrl(projectDir);
  const authorName = opts.authorName || gitAuthorName(projectDir);
  const branch = gitDefaultBranch(projectDir);

  // 5. Derive the package icon URL
  const packageIconUrl =
    opts.packageIconUrl || deriveIconUrl(projectDir, spec.name, resolvedRepoUrl, branch);

  // 6. Build the Chum block
  const block = buildChumBlock({
    appName: spec.name,
    authorName,
    license: spec.license,
    categories: categories?.length ? categories : ["Other"],
    repoUrl: resolvedRepoUrl,
    packageIconUrl,
    donationUrl: donationUrl || "",
  });

  // 7. Inject the block into %description and rewrite the spec
  const updatedSpec = injectChumBlock(specContent, block);
  fs.writeFileSync(specPath, updatedSpec, "utf8");

  const lines = [
    `✅ Chum metadata added to ${path.relative(projectDir, specPath)}`,
    "",
    "Auto-detected values:",
    `  App name:   ${spec.name}`,
    `  License:    ${spec.license}`,
    `  Repo URL:   ${resolvedRepoUrl || "(none — no git remote found)"}`,
    `  Author:     ${authorName || "(none — set git config user.name)"}`,
    `  Branch:     ${branch}`,
    `  Icon URL:   ${packageIconUrl || "(none — no icon file found in icons/)"}`,
    "",
    "Injected block:",
    "",
    block,
  ];

  return lines.join("\n");
}

// ─── Spec file discovery ─────────────────────────────────────────────────────

function findSpecFile(projectDir: string): string {
  // Prefer rpm/*.spec (standard Sailfish layout)
  const rpmDir = path.join(projectDir, "rpm");
  if (fs.existsSync(rpmDir)) {
    const specs = fs.readdirSync(rpmDir).filter((f) => f.endsWith(".spec"));
    if (specs.length === 1) return path.join(rpmDir, specs[0]);
    if (specs.length > 1)
      throw new Error(`Multiple spec files found in rpm/: ${specs.join(", ")}. Specify one.`);
  }
  // Fallback: root of project
  const rootSpecs = fs.readdirSync(projectDir).filter((f) => f.endsWith(".spec"));
  if (rootSpecs.length === 1) return path.join(projectDir, rootSpecs[0]);
  throw new Error(
    "No .spec file found in rpm/ or the project root. Is this a SailfishOS project?"
  );
}

// ─── Spec parser ─────────────────────────────────────────────────────────────

interface ParsedSpec {
  name: string;
  license: string;
  url: string;
  summary: string;
}

/**
 * Extracts the preamble fields we need without a full RPM spec parser.
 * All fields fall back to empty string if not found.
 */
function parseSpec(content: string): ParsedSpec {
  const field = (tag: string): string => {
    const m = content.match(new RegExp(`^${tag}:\\s*(.+)$`, "im"));
    return m ? m[1].trim() : "";
  };
  return {
    name: field("Name"),
    license: field("License"),
    url: field("URL"),
    summary: field("Summary"),
  };
}

// ─── Git helpers ─────────────────────────────────────────────────────────────

/** Normalises a remote URL to a browsable HTTPS URL without a .git suffix. */
function normaliseRemoteUrl(raw: string): string {
  let url = raw.trim().replace(/\.git$/, "");
  // SSH → HTTPS: git@github.com:user/repo → https://github.com/user/repo
  url = url.replace(/^git@([^:]+):(.+)$/, "https://$1/$2");
  return url;
}

function gitRemoteUrl(cwd: string): string {
  const r = spawnSync("git", ["remote", "get-url", "origin"], { encoding: "utf8", cwd });
  if (r.status !== 0 || !r.stdout.trim()) return "";
  return normaliseRemoteUrl(r.stdout);
}

function gitAuthorName(cwd: string): string {
  const r = spawnSync("git", ["config", "user.name"], { encoding: "utf8", cwd });
  return r.status === 0 ? r.stdout.trim() : "";
}

/**
 * Returns the name of the default remote branch (main, master, or whatever
 * origin/HEAD points to). Falls back to "master" if detection fails.
 */
function gitDefaultBranch(cwd: string): string {
  const r = spawnSync("git", ["symbolic-ref", "refs/remotes/origin/HEAD"], {
    encoding: "utf8",
    cwd,
  });
  if (r.status === 0 && r.stdout.trim()) {
    // refs/remotes/origin/main → main
    return r.stdout.trim().replace(/^refs\/remotes\/origin\//, "");
  }
  // Fallback: check if a local "main" branch exists
  const main = spawnSync("git", ["show-ref", "--verify", "refs/heads/main"], {
    encoding: "utf8",
    cwd,
  });
  return main.status === 0 ? "main" : "master";
}

// ─── Icon URL derivation ──────────────────────────────────────────────────────

/**
 * Looks for icon files in the project's icons/ directory and constructs a
 * raw hosting URL for GitHub or GitLab. SVG is preferred over PNG.
 *
 * Typical Sailfish layouts:
 *   icons/<appName>.svg
 *   icons/172x172/<appName>.png
 */
function deriveIconUrl(
  projectDir: string,
  appName: string,
  repoUrl: string,
  branch: string
): string {
  if (!repoUrl) return "";

  let rawBase: string;
  const gh = repoUrl.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)/);
  const gl = repoUrl.match(/^https:\/\/gitlab\.com\/([^/]+\/[^/]+)/);

  if (gh) {
    rawBase = `https://raw.githubusercontent.com/${gh[1]}/${branch}`;
  } else if (gl) {
    rawBase = `https://gitlab.com/${gl[1]}/-/raw/${branch}`;
  } else {
    return ""; // unknown forge — can't construct a raw URL
  }

  const candidates: Array<{ local: string; remote: string }> = [
    {
      local: path.join(projectDir, "icons", `${appName}.svg`),
      remote: `icons/${appName}.svg`,
    },
    {
      local: path.join(projectDir, "icons", "172x172", `${appName}.png`),
      remote: `icons/172x172/${appName}.png`,
    },
    {
      local: path.join(projectDir, "icons", "128x128", `${appName}.png`),
      remote: `icons/128x128/${appName}.png`,
    },
  ];

  for (const { local, remote } of candidates) {
    if (fs.existsSync(local)) return `${rawBase}/${remote}`;
  }

  return "";
}

// ─── Chum block builder ───────────────────────────────────────────────────────

interface ChumBlockOptions {
  appName: string;
  authorName: string;
  license: string;
  categories: string[];
  repoUrl: string;
  packageIconUrl: string;
  donationUrl: string;
}

/**
 * Builds the SailfishOS:Chum metadata block.
 *
 * Rules (https://github.com/sailfishos-chum/main/blob/main/Metadata.md):
 *  - NO empty or comment lines inside %if … %endif.
 *  - Must be the last paragraph of %description.
 */
function buildChumBlock(opts: ChumBlockOptions): string {
  const { appName, authorName, license, categories, repoUrl, packageIconUrl, donationUrl } = opts;

  const lines: string[] = [
    "# SailfishOS:Chum metadata — https://github.com/sailfishos-chum/main/blob/main/Metadata.md",
    "%if 0%{?_chum}",
    "Type: desktop-application",
  ];

  if (authorName) lines.push(`DeveloperName: ${authorName}`);
  if (license) lines.push(`PackageLicense: ${license}`);

  lines.push("Categories:");
  for (const cat of categories) lines.push(` - ${cat}`);

  if (repoUrl) {
    lines.push("Custom:");
    lines.push(`  Repo: ${repoUrl}`);
  }

  if (packageIconUrl) lines.push(`PackageIcon: ${packageIconUrl}`);

  const homepage = repoUrl || `https://example.org/${appName}`;
  lines.push("Links:");
  lines.push(`  Homepage: ${homepage}`);
  if (repoUrl) {
    lines.push(`  Bugtracker: ${repoUrl}/issues`);
    lines.push(`  Help: ${repoUrl}/discussions`);
  }
  if (donationUrl) lines.push(`  Donation: ${donationUrl}`);

  lines.push("%endif");
  return lines.join("\n");
}

// ─── Spec injection ───────────────────────────────────────────────────────────

/**
 * Injects `block` as the last paragraph of the %description section.
 *
 * The injected layout (per Chum spec rules):
 *
 *   %description
 *   <original description body>
 *
 *   # SailfishOS:Chum metadata — …
 *   %if 0%{?_chum}
 *   …
 *   %endif
 *
 *
 *   %prep
 *   …
 */
function injectChumBlock(specContent: string, block: string): string {
  const lines = specContent.split("\n");

  let descStart = -1;
  let descEnd = lines.length;

  for (let i = 0; i < lines.length; i++) {
    if (/^%description\b/.test(lines[i])) {
      descStart = i;
    } else if (descStart >= 0 && i > descStart && /^%[a-zA-Z]/.test(lines[i])) {
      descEnd = i;
      break;
    }
  }

  if (descStart < 0) {
    throw new Error(
      "No %description section found in the spec file. Cannot inject Chum metadata."
    );
  }

  // Find the last non-blank line of the description body
  let lastBody = descEnd - 1;
  while (lastBody > descStart && lines[lastBody].trim() === "") lastBody--;

  // Reassemble: body → blank line → chum block → blank lines before next section
  return [
    ...lines.slice(0, lastBody + 1),
    "",
    block,
    "",
    "",
    ...lines.slice(descEnd),
  ].join("\n");
}
