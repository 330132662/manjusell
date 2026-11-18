import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// 本配置在 sddy/tests/ 下，sddyRoot 即 sddy/ 根目录
const sddyRoot = fileURLToPath(new URL('..', import.meta.url))
const testsRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
	// root 上移到 sddy/，让 v8 provider 能追踪到 utils/*.js（它只统计 root 内文件）
	root: sddyRoot,
	resolve: {
		alias: {
			'@': sddyRoot,
			// 依赖装在 tests/node_modules，root 上移后需显式指路，否则 coverage provider 加载失败
			'@vitest/coverage-v8': path.join(testsRoot, 'node_modules/@vitest/coverage-v8/dist/index.js')
		}
	},
	test: {
		globals: true,
		environment: 'node',
		setupFiles: ['tests/setup.js'],
		include: ['tests/unit/**/*.test.js'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			include: ['utils/auth.js', 'utils/wxkf-order.js', 'utils/mp-format.js']
		}
	}
})
