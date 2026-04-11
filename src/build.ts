import { execSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import type { BuildOptions, CleanOptions, DeployOptions } from "./types.js";

// ─── sfdk discovery ──────────────────────────────────────────────────────────

function findSfdk(): string {
  // 1. Check PATH first
  try {
    execSync("sfdk --version", { stdio: "ignore" });
    return "sfdk";
  } catch {
    // not in PATH — fall through
  }

  // 2. Common install locations
  const home = process.env["HOME"] ?? "";
  const programFiles = process.env["PROGRAMFILES"] ?? "";

  const candidates = [
    path.join(home, "SailfishOS", "bin", "sfdk"),
    path.join(home, "SailfishOS", "bin", "sfdk.exe"),
    "/opt/SailfishOS/bin/sfdk",
    "C:\\SailfishOS\\bin\\sfdk.exe",
    path.join(programFiles, "SailfishOS", "bin", "sfdk.exe"),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }

  throw new Error(
    "sfdk not found. Install the Sailfish SDK and ensure sfdk is in PATH.\n" +
      "Download: https://docs.sailfishos.org/Develop/SDK_Installation/"
  );
}

function run(cmd: string, cwd: string, verbose = false): string {
  const result = spawnSync(cmd, {
    shell: true,
    cwd,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });

  const output = [result.stdout, result.stderr].filter(Boolean).join("\n");

  if (result.status !== 0) {
    throw new Error(`Command failed (exit ${result.status ?? "??"}):\n${output}`);
  }

  // Truncate to last 4 KB so the AI context doesn't overflow
  return verbose ? output : output.slice(-4000);
}

// ─── Build ───────────────────────────────────────────────────────────────────

export async function buildProject(opts: BuildOptions): Promise<string> {
  const { projectDir, target, outputDir, verbose } = opts;
  const sfdk = findSfdk();

  if (!fs.existsSync(projectDir)) {
    throw new Error(`Project directory not found: ${projectDir}`);
  }

  const lines: string[] = [];

  if (target) {
    lines.push(`Setting build target: ${target}`);
    run(`"${sfdk}" config target "${target}"`, projectDir);
  }

  lines.push("Running cmake configuration…");
  run(`"${sfdk}" cmake -B build -S .`, projectDir);

  lines.push("Building…");
  const buildOut = run(`"${sfdk}" cmake --build build`, projectDir, verbose);
  if (verbose) lines.push(buildOut);

  lines.push("Creating RPM package…");
  const rpmOut = run(`"${sfdk}" rpm`, projectDir, verbose);
  if (verbose) lines.push(rpmOut);

  const rpmsDir = path.join(projectDir, "RPMS");

  if (outputDir && fs.existsSync(rpmsDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    const rpms = fs.readdirSync(rpmsDir).filter((f) => f.endsWith(".rpm"));
    for (const rpm of rpms) {
      fs.copyFileSync(path.join(rpmsDir, rpm), path.join(outputDir, rpm));
      lines.push(`📦 Copied ${rpm} → ${outputDir}`);
    }
  }

  if (fs.existsSync(rpmsDir)) {
    const rpms = fs.readdirSync(rpmsDir).filter((f) => f.endsWith(".rpm"));
    lines.push("", "✅ Build succeeded. Produced packages:");
    rpms.forEach((r) => lines.push(`  ${path.join(rpmsDir, r)}`));
  } else {
    lines.push("✅ Build succeeded (no RPMS directory found — check build output).");
  }

  return lines.join("\n");
}

// ─── Clean ───────────────────────────────────────────────────────────────────

export async function cleanProject(opts: CleanOptions): Promise<string> {
  const { projectDir } = opts;
  const sfdk = findSfdk();

  if (!fs.existsSync(projectDir)) {
    throw new Error(`Project directory not found: ${projectDir}`);
  }

  const buildDir = path.join(projectDir, "build");
  if (fs.existsSync(buildDir)) {
    run(`"${sfdk}" cmake --build build --target clean`, projectDir);
  }

  return "✅ Project cleaned.";
}

// ─── Deploy ──────────────────────────────────────────────────────────────────

export async function deployProject(opts: DeployOptions): Promise<string> {
  const { projectDir, device } = opts;
  const sfdk = findSfdk();

  if (!fs.existsSync(projectDir)) {
    throw new Error(`Project directory not found: ${projectDir}`);
  }

  const lines: string[] = [];

  if (device) {
    lines.push(`Setting active device: ${device}`);
    run(`"${sfdk}" config device "${device}"`, projectDir);
  }

  lines.push("Deploying to device…");
  const out = run(`"${sfdk}" deploy --sdk`, projectDir, true);
  lines.push(out, "✅ Deploy complete.");

  return lines.join("\n");
}
