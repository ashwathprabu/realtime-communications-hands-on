installing pm2
```
sudo npm install -g pm2

```

starting the server
```
pm2 start ecosystem.config.js
```

checking the cluster process status
```
pm2 status api
```

restart cluster process
pm2 restart
```


delete cluster process
```
pm2 delete api
```

list process
```
pm2 list
```

 