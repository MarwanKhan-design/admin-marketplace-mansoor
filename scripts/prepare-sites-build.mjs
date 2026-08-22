import { cp, mkdir } from 'node:fs/promises'

await mkdir('dist/server', { recursive: true })
await cp('dist/my_admin_marketplace/index.js', 'dist/server/index.js')
