import "server-only";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export type VerificationStep = "typecheck" | "lint" | "build";

export type VerificationStepResult = {
  step: VerificationStep;
  success: boolean;
  durationMs: number;
  output: string;
};

export type ProjectVerificationResult = {
  success: boolean;
  steps: VerificationStepResult[];
  completedAt: string;
};

const PROJECT_ROOT = path.resolve(process.cwd());
const MAX_OUTPUT = 12_000;

function trimOutput(text: string): string {
  if (text.length <= MAX_OUTPUT) return text;
  return `${text.slice(0, MAX_OUTPUT)}\n…[truncated]`;
}

async function runStep(step: VerificationStep): Promise<VerificationStepResult> {
  const started = Date.now();
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

  try {
    const { stdout, stderr } = await execFileAsync(npmCmd, ["run", step], {
      cwd: PROJECT_ROOT,
      env: { ...process.env, NODE_ENV: "production" },
      maxBuffer: 1024 * 1024 * 4,
    });
    return {
      step,
      success: true,
      durationMs: Date.now() - started,
      output: trimOutput(`${stdout}\n${stderr}`.trim()),
    };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; message?: string };
    const output = trimOutput(
      `${err.stdout ?? ""}\n${err.stderr ?? ""}\n${err.message ?? "Command failed"}`.trim(),
    );
    return {
      step,
      success: false,
      durationMs: Date.now() - started,
      output,
    };
  }
}

export async function runProjectVerification(): Promise<ProjectVerificationResult> {
  const steps: VerificationStep[] = ["typecheck", "lint", "build"];
  const results: VerificationStepResult[] = [];

  for (const step of steps) {
    const result = await runStep(step);
    results.push(result);
    if (!result.success) break;
  }

  return {
    success: results.every((r) => r.success),
    steps: results,
    completedAt: new Date().toISOString(),
  };
}
