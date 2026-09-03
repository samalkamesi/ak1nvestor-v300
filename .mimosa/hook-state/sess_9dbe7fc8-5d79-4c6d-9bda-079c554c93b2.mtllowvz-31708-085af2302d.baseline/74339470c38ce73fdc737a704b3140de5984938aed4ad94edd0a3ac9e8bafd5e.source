#!/bin/bash
cd /home/z/my-project
while true; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 http://localhost:3000/ 2>/dev/null)
  if [ "$CODE" != "200" ]; then
    pkill -9 -f "next dev" 2>/dev/null
    sleep 3
    node /home/z/my-project/node_modules/.bin/next dev -p 3000 > /home/z/my-project/dev.log 2>&1 &
    disown
    sleep 10
  fi
  sleep 15
done
