/**
 * Free-tier backend cold starts are the main source of "Login failed" reports:
 * Render idles the service out after ~15 minutes, and the next request has to
 * boot the container (30-60s). We fire a cheap `/health` probe as soon as a page
 * mounts so the backend is usually awake by the time the user submits a form,
 * and we remember whether that wake-up finished so error copy can say "starting
 * up" instead of a misleading generic timeout.
 */

type WarmState = 'cold' | 'warming' | 'warm';

/** Long enough to outlast a full container boot; the probe is fire-and-forget. */
const WAKE_TIMEOUT_MS = 90_000;

let state: WarmState = 'cold';
let inFlight: Promise<void> | null = null;

/** True once a health probe has succeeded in this page session. */
export const isBackendWarm = () => state === 'warm';

/**
 * Wake the backend if it might be asleep. Idempotent and safe to call from
 * multiple mounts: concurrent callers share one probe. A failed probe resets the
 * flag so a later call can retry.
 */
export const prewarmBackend = (): Promise<void> => {
  if (state === 'warm') return Promise.resolve();
  if (inFlight) return inFlight;

  state = 'warming';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WAKE_TIMEOUT_MS);

  inFlight = fetch('/health', { method: 'GET', cache: 'no-store', signal: controller.signal })
    .then((res) => {
      if (res.ok) state = 'warm';
    })
    .catch(() => {
      // Swallow: a probe failure only means we stay in 'warming' for error copy.
    })
    .finally(() => {
      clearTimeout(timer);
      inFlight = null;
    });

  return inFlight;
};
