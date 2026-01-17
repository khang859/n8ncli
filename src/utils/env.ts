import { isatty } from 'tty';

/**
 * Environment detection utilities for CLI behavior
 */

/** Whether stdout is a TTY (interactive terminal) */
export const isTTY = isatty(process.stdout.fd);

/** Whether stderr is a TTY */
export const isStderrTTY = isatty(process.stderr.fd);

/** Whether running in CI environment */
export const isCI = process.env.CI === 'true' || process.env.CI === '1';

/** Whether colors should be disabled */
export const noColor = Boolean(process.env.NO_COLOR);

/** Whether the environment is interactive (TTY and not CI) */
export const isInteractive = isTTY && !isCI;

/** Whether to use colors (TTY, not CI, and NO_COLOR not set) */
export const useColor = isTTY && !noColor;
