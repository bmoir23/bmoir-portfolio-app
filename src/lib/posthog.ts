import type { AstroCookies } from 'astro'
import { PostHog } from 'posthog-node'
import { getEnv } from '@/lib/runtime-env'

/**
 * Create a per-request PostHog client for Cloudflare Workers (serverless).
 * flushAt:1 / flushInterval:0 ensures events are sent before the worker exits.
 * Always call `await posthog.shutdown()` after capturing events.
 */
export function createPosthogClient(locals: unknown): PostHog {
  const apiKey = getEnv(locals, 'POSTHOG_API_KEY') ?? ''
  const host = getEnv(locals, 'POSTHOG_HOST') ?? 'https://us.i.posthog.com'

  return new PostHog(apiKey, {
    host,
    flushAt: 1,
    flushInterval: 0,
    enableExceptionAutocapture: true,
  })
}

/**
 * Identify a server-side capture without the visitor's IP address.
 * Reuses the anonymous ID that posthog-js stores in its cookie, so server and
 * browser events join the same person. Without that cookie, send a random
 * per-request ID and skip the person profile.
 */
export function getVisitorIdentity(
  locals: unknown,
  cookies: AstroCookies,
): { distinctId: string; properties: Record<string, unknown> } {
  const token = getEnv(locals, 'PUBLIC_POSTHOG_API_KEY') ?? getEnv(locals, 'POSTHOG_API_KEY')
  const cookie = token ? cookies.get(`ph_${token}_posthog`)?.value : undefined
  if (cookie) {
    try {
      const { distinct_id } = JSON.parse(cookie)
      if (typeof distinct_id === 'string' && distinct_id) {
        return { distinctId: distinct_id, properties: {} }
      }
    } catch {
      // Malformed cookie — fall through to an anonymous capture
    }
  }
  return { distinctId: crypto.randomUUID(), properties: { $process_person_profile: false } }
}
