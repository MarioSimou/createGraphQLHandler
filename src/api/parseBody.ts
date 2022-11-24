import type { Result, Data } from './types'
import { newErrorResult, newSuccessfulResult } from './utils'

export const ErrBodyNotFound = new Error('error: request body not found')

async function* decodeBodyAsyncGenerator(
  body: NonNullable<Request['body']>
): AsyncGenerator<string> {
  const utf8Decoder = new TextDecoder('utf8')
  const reader = body.getReader()
  while (true) {
    const { done, value } = await reader.read()
    yield utf8Decoder.decode(value)
    if (done) {
      return
    }
  }
}

export const parseBody = async (
  body: Request['body']
): Promise<Result<Data>> => {
  try {
    if (!body) {
      return newErrorResult(ErrBodyNotFound)
    }

    let parts = ''
    for await (const part of decodeBodyAsyncGenerator(body)) {
      parts += part
    }

    return newSuccessfulResult(JSON.parse(parts))
  } catch (e) {
    return newErrorResult(e)
  }
}
