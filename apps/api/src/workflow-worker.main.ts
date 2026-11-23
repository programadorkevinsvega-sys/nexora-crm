import { NestFactory } from '@nestjs/core'
import { resolve } from 'path'
import { WorkflowWorkerModule } from './modules/automation/infrastructure/workflow-worker.module'

function loadRootEnv(): void {
  const envPath = resolve(__dirname, '../../../.env')
  const loadEnvFile = (process as NodeJS.Process & { loadEnvFile?: (path?: string) => void }).loadEnvFile
  if (typeof loadEnvFile === 'function') loadEnvFile(envPath)
}

async function bootstrap(): Promise<void> {
  loadRootEnv()
  const app = await NestFactory.createApplicationContext(WorkflowWorkerModule)
  app.enableShutdownHooks()
  console.log('Nexora workflow worker started')
}

void bootstrap()
