import express from 'express'
import serveStatic from 'serve-static'
import { spawn } from 'child_process'
import Ganache from 'ganache-core'
import opener from 'opener'
import fs from 'fs'
import Web3 from 'web3'
import path from "path"

import simpleIssuer from './issuer-services/_simple'

const HOST = process.env.HOST || 'localhost'
const app = express()

app.get('/', (req, res) => {
  var html = fs.readFileSync(__dirname + '/public/dev.html').toString()
  res.send(html.replace(/\{HOST\}/g, `http://${HOST}:8082/`))
})
app.use(serveStatic('public'))

try {
  var { simpleApp } = require('./issuer-services/config.json')
  simpleIssuer(app, { web3: new Web3(), simpleApp })
} catch(e) {
  /* Ignore */
}

const startGanache = () =>
  new Promise((resolve, reject) => {
    try {
      fs.mkdirSync('./data/db')
    } catch (e) {
      /* Ignore */
    }
    var server = Ganache.server({
      total_accounts: 5,
      default_balance_ether: 100,
      db_path: 'data/db',
      network_id: 999,
      seed: 123,
      mnemonic: "logic cradle area quality lumber pitch radar sense dove fault capital observe"
      // blocktime: 3
    })
    server.listen(8545, err => {
      if (err) {
        return reject(err)
      }
      console.log('Ganache listening. Starting webpack...')
      resolve()
    })
  })

async function start() {
  await startGanache()
  const cmd = path.join(__dirname, "node_modules", ".bin", "webpack-dev-server")
  const webpackDevServer = spawn(cmd, [
    '--info=false',
    '--port=8082',
    '--host=0.0.0.0'
  ], { shell: true })
  webpackDevServer.stdout.pipe(process.stdout)
  webpackDevServer.stderr.pipe(process.stderr)
  process.on('exit', () => webpackDevServer.kill())

  const PORT = process.env.PORT || 3333
  app.listen(PORT, () => {
    console.log(`\nListening on port ${PORT}\n`)
    setTimeout(() => {
      try{
        const browser = opener(`http://${HOST}:${PORT}`)
        browser.unref();
      }catch(err){
        console.log("open browser", err.message);
      }
    }, 2000)
  })
}

start()
