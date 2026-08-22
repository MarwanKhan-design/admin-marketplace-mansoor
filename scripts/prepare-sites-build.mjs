import { cp, mkdir, rm } from 'node:fs/promises'

await mkdir('dist/server', { recursive: true })
await cp('dist/my_admin_marketplace/index.js', 'dist/server/index.js')

await rm('dist/assets', { recursive: true, force: true })
await cp('dist/client/assets', 'dist/assets', { recursive: true })
await cp('dist/client/index.html', 'dist/index.html')

await mkdir('dist/seller', { recursive: true })
await cp('dist/client/index.html', 'dist/seller/index.html')
