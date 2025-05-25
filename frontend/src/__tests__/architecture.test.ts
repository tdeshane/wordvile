import fs from 'fs'
import path from 'path'

describe('Architecture Tests', () => {
  const srcPath = path.join(__dirname, '..')

  test('should have proper folder structure', () => {
    const requiredFolders = [
      'assets',
      'components',
      'data',
      'features',
      'hooks',
      'services',
      'store',
      'styles',
      'types',
      'utils'
    ]

    requiredFolders.forEach(folder => {
      const folderPath = path.join(srcPath, folder)
      expect(fs.existsSync(folderPath)).toBe(true)
    })
  })

  test('should have Vite configuration', () => {
    const vitePath = path.join(__dirname, '../../vite.config.ts')
    expect(fs.existsSync(vitePath)).toBe(true)
  })

  test('should have environment files', () => {
    const envFiles = ['.env.development', '.env.production']
    envFiles.forEach(file => {
      const envPath = path.join(__dirname, '../../', file)
      expect(fs.existsSync(envPath)).toBe(true)
    })
  })

  test('should have state management setup', () => {
    const storePath = path.join(srcPath, 'store/index.ts')
    expect(fs.existsSync(storePath)).toBe(true)
  })

  test('should have logging utility', () => {
    const loggerPath = path.join(srcPath, 'utils/logger.ts')
    expect(fs.existsSync(loggerPath)).toBe(true)
  })
})