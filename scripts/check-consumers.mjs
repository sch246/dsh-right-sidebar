/** Reject sidebar removal while an installed package declares its use. */
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const profile = process.argv[2]
if (!profile) throw new Error('Provide the selected profile directory')
const sidebar = '@dsh-external/dsh-right-sidebar'
const manifest = JSON.parse(await readFile(resolve(profile, 'package.json'), 'utf8'))
for (const name of Object.keys(manifest.dependencies ?? {})) {
  if (name === sidebar) continue
  const consumer = JSON.parse(await readFile(resolve(profile, 'node_modules', name, 'package.json'), 'utf8'))
  if (consumer.dependencies?.[sidebar] || consumer.peerDependencies?.[sidebar]
    || consumer.dsh?.client?.inject?.includes(sidebar)) {
    throw new Error(`Cannot remove ${sidebar}: installed consumer ${name} requires it`)
  }
}
