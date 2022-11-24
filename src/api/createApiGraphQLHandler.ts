import type {
  BaseContext,
  ContextThunk,
  HTTPGraphQLRequest,
} from '@apollo/server'
import type { MaybeErrorBody, Data, Options } from './types'
import {
  newErrorResult,
  newSuccessfulResult,
  mapHeadersToMap,
  isErrorBody,
} from './utils'
import { parseBody } from './parseBody'
import url from 'node:url'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultContextThunk: ContextThunk<any> = async () => ({})

export const createApiGraphQLHandler =
  <TData extends Data = Data, TContext extends BaseContext = BaseContext>(
    options: Options<TData, TContext>
  ) =>
  async (event: APIEvent): Promise<void> => {
    try {
      options.server.assertStarted('graphqlHandler')

      const bodyResult = await parseBody(event.request.body)
      if (!bodyResult.success) {
        return options.handler(bodyResult)
      }

      const httpGraphQLRequest: HTTPGraphQLRequest = {
        method: event.request.method,
        search: url.parse(event.request.url).search ?? '',
        headers: mapHeadersToMap(event.request.headers),
        body: bodyResult.data,
      }
      const context = options?.context ?? defaultContextThunk

      const httpGraphQLRequestResponse =
        await options.server.executeHTTPGraphQLRequest({
          httpGraphQLRequest,
          context,
        })

      if (httpGraphQLRequestResponse.body.kind === 'complete') {
        const responseBody: MaybeErrorBody<TData> = JSON.parse(
          httpGraphQLRequestResponse.body.string
        )
        if (isErrorBody(responseBody)) {
          const [e] = responseBody.errors
          return options.handler(newErrorResult(e))
        }
        return options.handler(newSuccessfulResult(responseBody))
      }
      // Implement logic to handle asyncronous iterators
      throw new Error(
        'error: asynchronous iterators are not supported at the moment'
      )
    } catch (e) {
      if (e instanceof Error) {
        return options.handler(newErrorResult(e))
      }

      return options.handler(newErrorResult(new Error(String(e))))
    }
  }
