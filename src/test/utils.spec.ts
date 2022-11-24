import {
  newErrorResult,
  newSuccessfulResult,
  mapHeadersToMap,
} from '../api/utils'
import { describe, it, expect } from 'vitest'
import { Headers } from 'undici'

describe('utils', () => {
  describe('mapHeadersToMap', () => {
    it('should convert a Headers instance to a map of strings', () => {
      const headers = new Headers([
        ['content-type', 'application/json'],
        ['authorization', 'Bearer test'],
      ])
      const headersMap = new Map([
        ['content-type', 'application/json'],
        ['authorization', 'Bearer test'],
      ])
      expect(mapHeadersToMap(headers)).toEqual(headersMap)
    })
  })
  describe('newErrorResult', () => {
    it('should return an error result when a string is passed', () => {
      expect(newErrorResult('error')).toEqual({
        success: false,
        error: new Error('error'),
      })
    })

    it('should return an error result when an error instance is passed', () => {
      const error = new Error('error')
      expect(newErrorResult(error)).toEqual({
        success: false,
        error,
      })
    })
  })

  describe('newSuccessfulResult', () => {
    it('should return a successful result', () => {
      const data = { message: 'ok' }
      expect(newSuccessfulResult(data)).toEqual({ success: true, data })
    })
  })
})
