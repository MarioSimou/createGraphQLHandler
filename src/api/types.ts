import type { BaseContext, ContextThunk, ApolloServer } from '@apollo/server'
export type Maybe<TData> = TData | undefined

export type Data = Record<string, unknown>

export type MaybeErrorBody<TData extends Data> = TData | { errors: Error[] }

export type ErrorResult = {
  success: false
  error: Error
}

export type SuccessfulResult<TData extends Data> = {
  success: true
  data: TData
}

export type Result<TData extends Data> = SuccessfulResult<TData> | ErrorResult

export type Handler<TData extends Data = Data> = (res: Result<TData>) => void

export type Options<
  TData extends Data,
  TContext extends BaseContext = BaseContext
> = {
  context?: ContextThunk<TContext>
  server: ApolloServer<TContext>
  handler: Handler<TData>
}
