import { readdirSync, readFileSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const sourceRoots = ['apps', 'frontend', 'packages', 'scripts']
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', '.next', '.turbo', 'coverage', 'build', 'out'])
const supportedExtensions = new Set(['.ts', '.tsx', '.mts', '.cts'])
const violations = []

function collectTypeScriptFiles(directory) {
  let entries
  try {
    entries = readdirSync(directory, { withFileTypes: true })
  } catch {
    return []
  }

  const files = []
  for (const entry of entries) {
    const fullPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) files.push(...collectTypeScriptFiles(fullPath))
      continue
    }
    if (entry.isFile() && supportedExtensions.has(extname(entry.name))) files.push(fullPath)
  }
  return files
}

function inspectFile(filePath) {
  const sourceText = readFileSync(filePath, 'utf8')
  const extension = extname(filePath) === '.tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, extension)

  function visit(node) {
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
      violations.push(`${relative(repositoryRoot, filePath)}:${line + 1}: explicit any type`)
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)

  const suppressionPattern = /eslint-disable(?:-next-line|-line)?[^\\r\\n]*(?:@typescript-eslint\\/no-explicit-any|no-explicit-any)/g
  for (const match of sourceText.matchAll(suppressionPattern)) {
    const line = sourceText.slice(0, match.index).split('\\n').length
    violations.push(`${relative(repositoryRoot, filePath)}:${line}: ESLint suppression for any-type rule`)
  }
}

for (const sourceRoot of sourceRoots) {
  for (const filePath of collectTypeScriptFiles(join(repositoryRoot, sourceRoot))) inspectFile(filePath)
}

if (violations.length > 0) {
  process.stderr.write(`Type policy failed: found ${violations.length} forbidden any usage(s).\\n`)
  for (const violation of violations) process.stderr.write(` - ${violation}\\n`)
  process.exitCode = 1
} else {
  process.stdout.write('Type policy passed: no explicit any types or any-rule suppressions found.\\n')
}
