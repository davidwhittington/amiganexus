module.exports = {
  apps: [
    {
      name:        'amiganexus',
      script:      'bun',
      args:        'run src/index.ts',
      cwd:         '/var/www/amiganexus.com/server',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT:     '3000',
      },
      // Logging
      out_file:    '/var/log/pm2/amiganexus-out.log',
      error_file:  '/var/log/pm2/amiganexus-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs:  true,
      // Restart policy
      autorestart: true,
      max_restarts: 10,
      min_uptime:   '10s',
      restart_delay: 2000,
    },
  ],
}
