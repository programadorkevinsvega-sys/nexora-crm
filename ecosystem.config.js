// ==============================================================================
// Nexora CRM — PM2 Production Ecosystem Configuration
// ==============================================================================

module.exports = {
  apps: [
    {
      name: 'nexora-api',
      cwd: './apps/api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
        GRPC_PORT: 50059,
      },
      time: true,
    },
    {
      name: 'nexora-bff',
      cwd: './apps/bff',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3006,
        API_CORE_GRPC_URL: '127.0.0.1:50059',
      },
      time: true,
    },
    {
      name: 'nexora-frontend',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      time: true,
    },
  ],
}
