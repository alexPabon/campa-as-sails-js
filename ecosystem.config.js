module.exports = {
  apps : [{
    name: 'my-app',
    script: 'app.js',
    instances: '1',
    autorestart: false,
    startup:true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 1337
    }
  }],
};

