import * as undici from 'undici'

declare global {
  type Headers = undici.Headers
  type Request = undici.Request
  type Response = undici.Response

  interface APIEvent extends FetchEvent {
    params: { [key: string]: string }
    request: undici.Request
    env: unknown
    $type: '$FETCH'
    fetch: (route: string, init: undici.RequestInit) => Promise<undici.Response>
  }
}
