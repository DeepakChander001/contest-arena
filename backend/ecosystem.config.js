module.exports = {
  apps: [
    {
      name: 'contest-backend',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'fork',

      // Use dotenv/config to load .env file
      node_args: '-r dotenv/config',

      // Environment variables (fallback if .env not working)
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },

      // PM2 configuration
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',

      // Logging
      error_file: '~/.pm2/logs/contest-backend-error.log',
      out_file: '~/.pm2/logs/contest-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Working directory (important for finding .env)
      cwd: '/var/www/contest-backend/backend',

      // Dotenv path configuration
      args: 'dotenv_config_path=/var/www/contest-backend/backend/.env',
    },
  ],
};
