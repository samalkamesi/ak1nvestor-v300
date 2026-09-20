#!/bin/bash
# ROND 113: V215.1-deploy — bygge under deploy-lås i prod-trädet (våg 100-
# regeln: ALDRIG olåst; prod-synken/kraschvakten äger samma lås).
exec flock -n /tmp/ak1a-deploy.lock bash -c 'cd /home/ak1a/AK1 && npm ci --no-audit --no-fund && npm run build && pm2 restart ak1a && sleep 6 && echo "PROD-HTTP:$(curl -s -o /dev/null -w "%{http_code}" https://lab.ak1nvestor.com/)"'
