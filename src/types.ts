export type WaitUntil = 'load' | 'domcontentloaded' | 'networkidle' | 'commit'

export interface Options {
  servePath: string
  port?: number
  waitUntil?: WaitUntil
}

export interface LogError {
  type: 'error'
  timestamp: number
  error: unknown
}

export interface LogConsole {
  type: 'console'
  timestamp: number
  arguments: unknown[]
}

export type RuntimeLog = LogError | LogConsole
