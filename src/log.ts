import c from 'picocolors'
import type { RuntimeErrorLog } from './types'

export function printErrorLogs(logs: RuntimeErrorLog[]) {
  if (!logs.length) {
    console.log()
    console.log(c.inverse(c.bold(c.green(' DEPLOY CHECK '))) + c.green(' No runtime errors found '))
    return
  }
  console.error()
  console.error(c.inverse(c.bold(c.red(' DEPLOY CHECK '))) + c.red(` ${logs.length} Runtime errors found`))
  console.error()
  logs.forEach((log, idx) => {
    console.error(c.yellow(`\n----------- ${c.gray(new Date(log.timestamp).toLocaleDateString())} Error ${idx + 1} -------------`))
    if (log.type === 'page-error')
      console.error(log.error)
    else
      console.error(...log.arguments)
  })
}
