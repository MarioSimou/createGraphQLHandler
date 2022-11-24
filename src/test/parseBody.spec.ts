import { parseBody, ErrBodyNotFound } from '../api/parseBody'
import { ReadableStream } from 'node:stream/web'

const newTestBody = (...chunks: string[]) => {
  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    start: controller => {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
      }
      controller.close()
    },
  })
}

describe('parseBody', () => {
  it('should return an error result saying that the body was missing', async () => {
    expect(await parseBody(null)).toEqual({
      success: false,
      error: ErrBodyNotFound,
    })
  })

  it('should return an error result saying that the JSON could not been parsed', async () => {
    const body = newTestBody('')
    expect(await parseBody(body)).toEqual({
      success: false,
      error: new Error('Unexpected end of JSON input'),
    })
  })

  it('should successfully parse a string sequence to valid data', async () => {
    const body = newTestBody('{"query": "query hello { hello }"}')
    expect(await parseBody(body)).toEqual({
      success: true,
      data: { query: 'query hello { hello }' },
    })
  })

  it('should successfully parse an array of strings to valid data', async () => {
    const body = newTestBody('{"query":', '"query hello { hello }"}')
    expect(await parseBody(body)).toEqual({
      success: true,
      data: { query: 'query hello { hello }' },
    })
  })
})
