#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const candidates = [
  path.join(__dirname, '.next/standalone/frontend/server.js'),
  path.join(__dirname, '.next/standalone/server.js'),
]

const serverPath = candidates.find((p) => fs.existsSync(p))

if (!serverPath) {
  console.error('\n❌ No se encontró el build standalone de producción.')
  console.error('👉 Por favor ejecuta primero: pnpm build\n')
  process.exit(1)
}

require(serverPath)
