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
