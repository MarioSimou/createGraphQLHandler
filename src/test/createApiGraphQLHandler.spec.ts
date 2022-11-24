import { ApolloServer } from '@apollo/server'
import { createApiGraphQLHandler } from '../api/createApiGraphQLHandler'
import { gql } from 'graphql-tag'
import { afterAll, it, describe, beforeAll, vi } from 'vitest'
import { Headers, Request } from 'undici'
import { Handler } from '../api/types'
import { ErrBodyNotFound, parseBody } from '../api/parseBody'

const newRequest = (
  method: Request['method'],
  body?: Record<string, unknown>,
  headers?: Request['headers']
) =>
  new Request('http://localhost:3000/graphql', {
    method,
    headers,
    body: JSON.stringify(body),
  })

const newApiEvent = (
  method: Request['method'],
  body?: Record<string, unknown>,
  headers: Request['headers'] = new Headers({
    'content-type': 'application/json',
  })
) =>
  ({
    params: {},
    request: newRequest(method, body, headers),
  } as APIEvent)

vi.mock('../api/parseBody')

describe('createApiGraphQLHandler', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const typeDefs = gql`
    type Query {
      hello: String!
    }
  `
  const resolvers = {
    Query: {
      hello: () => 'hello world',
    },
  }
  const server = new ApolloServer({ typeDefs, resolvers })

  describe('without running the server', () => {
    it('should return an error result', async () => {
      const event = newApiEvent('POST', { query: 'query hello { hello }' })
      const handler: Handler = res =>
        expect(res).toEqual({
          success: false,
          error: new Error(
            'You must `await server.start()` before calling `graphqlHandler`'
          ),
        })

      await createApiGraphQLHandler({ server, handler })(event)
    })
  })

  describe('with a running server', () => {
    beforeAll(async () => await server.start())
    afterAll(async () => await server.stop())

    it('should return an error result when it fails parsing the request body', async () => {
      const handler: Handler = res =>
        expect(res).toEqual({
          success: false,
          error: ErrBodyNotFound,
        })
      const event = newApiEvent('POST')
      await createApiGraphQLHandler({ server, handler })(event)
    })

    it('should return an error result when the graphql server responds with an error', async () => {
      const handler: Handler = res => {
        expect(res).toMatchObject({
          success: false,
          error: {
            message: 'Cannot query field "wrongQuery" on type "Query".',
            extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
          },
        })
      }
      const event = newApiEvent('POST', {
        query: 'query wrongQuery { wrongQuery }',
      })
      await createApiGraphQLHandler({ server, handler })(event)
    })

    it('should return an error result when an unexpected is thrown', async () => {
      vi.mocked(parseBody).mockImplementationOnce(() => {
        throw new Error('unexpected error')
      })

      const handler: Handler = res =>
        expect(res).toEqual({
          success: false,
          error: new Error('unexpected error'),
        })

      const event = newApiEvent('POST', {
        query: 'query wrongQuery { wrongQuery }',
      })
      await createApiGraphQLHandler({ server, handler })(event)
    })

    it('should return a successful result', async () => {
      const handler: Handler<{ data: { hello: string } }> = res =>
        expect(res).toEqual({
          success: true,
          data: { data: { hello: 'hello world' } },
        })
      const event = newApiEvent('POST', { query: `query hello { hello }` })

      await createApiGraphQLHandler({ server, handler })(event)
    })
  })
})
