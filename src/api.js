/**
 * api.js — Anthropic API call wrapper
 *
 * In development: calls api.anthropic.com directly (key from .env)
 * In production:  route through your own backend to protect the API key
 *
 * Example Vercel Edge Function (api/chat.js):
 *
 *   export const config = { runtime: 'edge' }
 *   export default async function handler(req) {
 *     const body = await req.json()
 *     const res = await fetch('https://api.anthropic.com/v1/messages', {
 *       method: 'POST',
 *       headers: {
 *         'Content-Type': 'application/json',
 *         'x-api-key': process.env.ANTHROPIC_API_KEY,
 *         'anthropic-version': '2023-06-01',
 *       },
 *       body: JSON.stringify(body),
 *     })
 *     return new Response(res.body, { headers: { 'Content-Type': 'text/event-stream' } })
 *   }
 *
 * Then change ANTHROPIC_ENDPOINT below to '/api/chat'
 */

export const ANTHROPIC_ENDPOINT =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_PROXY === 'true'
    ? '/api/chat'
    : 'https://api.anthropic.com/v1/messages'

export function buildHeaders() {
  const key = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_ANTHROPIC_API_KEY : undefined
  const headers = { 'Content-Type': 'application/json' }
  if (key) {
    headers['x-api-key'] = key
    headers['anthropic-version'] = '2023-06-01'
  }
  return headers
}
