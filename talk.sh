/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --force-app-mode \
  --user-data-dir=$HOME/.tmp/chrome-app-mode/ \
  --app=http://talk:8080/ &
http-server slides -p 8080