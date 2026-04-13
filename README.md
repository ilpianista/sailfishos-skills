Agent Skills for use with SailfishOS.

These skills follow the [Agent Skills specification](https://agentskills.io/specification) so they can be used by any skills-compatible agent, including Claude Code and Codex CLI.

## Installation

### Marketplace

```
/plugin marketplace add ilpianista/sailfishos-skills
/plugin install ilpianista@sailfishos-skills
```

### npx skills

```
npx skills add git@github.com:ilpianista/sailfishos-skills.git
```

### Manually

#### Claude Code

Add the contents of this repo to a `/.claude` folder in the root of your SailfisOS project (or whichever folder you're using with Claude Code). See more in the [official Claude Skills documentation](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview).

#### Codex CLI

Copy the `skills/` directory into your Codex skills path (typically `~/.codex/skills`). See the [Agent Skills specification](https://agentskills.io/specification) for the standard skill format.

#### OpenCode

Clone the entire repo into the OpenCode skills directory (`~/.opencode/skills/`):

```sh
git clone https://github.com/ilpianista/sailfishos-skills.git ~/.opencode/skills/sailfishos-skills
```

Do not copy only the inner `skills/` folder — clone the full repo so the directory structure is `~/.opencode/skills/sailfishos-skills/skills/<skill-name>/SKILL.md`.

OpenCode auto-discovers all `SKILL.md` files under `~/.opencode/skills/`. No changes to `opencode.json` or any config file are needed. Skills become available after restarting OpenCode.

## Skills

| Skill | Description |
|-------|-------------|
| [sailfishos-app](skills/sailfishos-app) | This skill makes you an expert [SailfishOS](https://sailfishos.org/) developer assistant. Use it to scaffold projects, generate idiomatic QML/C++ code, run builds, and give precise platform guidance. |
