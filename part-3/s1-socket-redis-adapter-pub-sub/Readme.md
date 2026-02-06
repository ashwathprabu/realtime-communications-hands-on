### downloading redis
```
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:latest

```

# Terminal 1 — subscribe
```
docker exec -it redis redis-cli
SUBSCRIBE chat

```


Terminal 2 — publish
```
docker exec -it redis redis-cli
PUBLISH chat "hello from redis"

```