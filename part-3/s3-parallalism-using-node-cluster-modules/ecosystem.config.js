module.exports = {
  apps: [
    {
      name: 'api',
      script: 'pm2_cluster_node.js',
      exec_mode: 'cluster',
      instances: 'max', // one per vCPU
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
