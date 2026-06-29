import { BUG_REPORT_EMAIL, GAME_VERSION } from './version';

export type BugReportContextValue = string | number | boolean | null | undefined;
export type BugReportContext = Record<string, BugReportContextValue>;

function formatValue(value: BugReportContextValue): string {
  if (value === null || value === undefined) return 'n/a';
  return String(value);
}

function getRuntimeContext(): BugReportContext {
  if (typeof window === 'undefined') return {};
  return {
    version: GAME_VERSION,
    url: window.location.href,
    userAgent: window.navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    devicePixelRatio: window.devicePixelRatio,
    language: window.navigator.language,
    timestamp: new Date().toISOString()
  };
}

export function buildBugReportBody(context: BugReportContext = {}): string {
  const mergedContext = { ...getRuntimeContext(), ...context };
  const contextLines = Object.entries(mergedContext).map(([key, value]) => `- ${key}: ${formatValue(value)}`);

  return [
    'BUG REPORT — GOETIA',
    '',
    'Décris le bug :',
    '',
    '',
    'Étapes pour reproduire :',
    '1.',
    '2.',
    '3.',
    '',
    'Résultat obtenu :',
    '',
    '',
    'Résultat attendu :',
    '',
    '',
    'Contexte automatique :',
    ...contextLines
  ].join('\n');
}

export function openBugReportMail(context: BugReportContext = {}): void {
  if (typeof window === 'undefined') return;
  const subject = `[GOETIA ${GAME_VERSION}] Bug report`;
  const body = buildBugReportBody(context);
  const mailto = `mailto:${BUG_REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}
