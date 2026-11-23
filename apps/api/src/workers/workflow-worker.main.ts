import { NestFactory } from '@nestjs/core'
import { resolve } from 'node:path'
import { WorkflowWorkerModule } from '../modules/automation/workflow-worker.module'

function loadRootEnv(): void {
  const envPath = resolve(__dirname, '../../../.env')
  const loadEnvFile = (process as NodeJS.Process & { loadEnvFile?: (path?: string) => void }).loadEnvFile

  if (typeof loadEnvFile === 'function') {
    loadEnvFile(envPath)
  }
}

async function bootstrap(): Promise<void> {
  loadRootEnv()
  const context = await NestFactory.createApplicationContext(WorkflowWorkerModule)
  context.enableShutdownHooks()
  console.log('Nexora workflow worker is running')
}

void bootstrap().catch((error) => {
  console.error('Workflow worker bootstrap failed:', error)
  process.exit(1)
})
