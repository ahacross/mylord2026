import fs from 'fs'
import path from 'path'

const pkgPath = path.resolve(process.cwd(), 'package.json')

if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  const currentVersion = pkg.version || '0.0.0'

  let [major, minor, patch] = currentVersion.split('.').map(Number)

  patch += 1

  if (patch >= 100) {
    minor += 1
    patch = 0
  }
  if (minor >= 100) {
    major += 1
    minor = 0
  }

  const nextVersion = `${major}.${minor}.${patch}`
  pkg.version = nextVersion

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')
  console.log(`[Version Bump] ${pkg.name}: ${currentVersion} -> ${nextVersion}`)
}
