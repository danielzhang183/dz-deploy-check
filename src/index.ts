import { chromium } from 'playwright'
import sirv from 'sirv'
import polka from 'polka'
import c from 'picocolors'
import createDebug from 'debug'
import type { Options, RuntimeLog } from './types'

const debug = createDebug('deploy-check')

export async function serveAndCheck(options: Options) {
  const {
    port = 3000,
    servePath,
    waitUntil = 'networkidle',
  } = options

  const URL = `http://localhost:${port}`

  polka()
    .use(sirv(servePath))
    .listen(3000, (err: any) => {
      if (err)
        throw err
      debug(`> Served on ${URL}`)
    })

  const browser = await chromium.launch()
  debug('> Browser initialed')
  const page = await browser.newPage()
  debug('> New page created')

  const errorLogs: RuntimeLog[] = []

  page.on('console', async (message) => {
    if (message.type() === 'error') {
      errorLogs.push({
        type: 'console',
        timestamp: Date.now(),
        arguments: await Promise.all(message.args().map(i => i.jsonValue())),
      })
    }
  })
  page.on('pageerror', (err) => {
    errorLogs.push({
      type: 'error',
      timestamp: Date.now(),
      error: err,
    })
  })

  await page.goto(URL, { waitUntil })
  debug('> Navigated')

  Promise.all([
    page.close(),
    browser.close(),
  ]).catch()

  return errorLogs
}

export function printErrorLogs(logs: RuntimeLog[]) {
  console.error()
  console.error(c.inverse(c.bold(c.red(' DEPLOY CHECK '))) + c.red(` ${logs.length} Runtime errors found`))
  console.error()
  logs.forEach((log, idx) => {
    console.error(c.yellow(`----------- ${c.gray(new Date(log.timestamp).toLocaleDateString())} Error ${idx + 1} -------------`))
    if (log.type === 'error')
      console.error(log.error)
    else
      console.error(...log.arguments)
  })
}
