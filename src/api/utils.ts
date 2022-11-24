import type {
  Data,
  ErrorResult,
  SuccessfulResult,
  MaybeErrorBody,
} from './types'

export const isErrorBody = (
  body: MaybeErrorBody<Data>
): body is { errors: Error[] } =>
  Boolean(body.errors && (body as { errors: Error[] }).errors.length > 0)

export const mapHeadersToMap = (headers: Headers): Map<string, string> =>
  new Map(Array.from(headers))

export const newErrorResult = (e: Error | string): ErrorResult => {
  if (typeof e === 'string') {
    return { success: false, error: new Error(e) }
  }
  return { success: false, error: e }
}

export const newSuccessfulResult = <TData extends Data>(
  data: TData
): SuccessfulResult<TData> => ({ success: true, data })
