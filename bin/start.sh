#! /bin/bash

export NODE_ENV=production
export BASE_URL=/caseviewer
DAEMON="node www"
NAME=CaseViewer
DESC=CaseViewer
PIDFILE="CaseViewer.pid"
case "$1" in
start)
    echo "Starting $DESC: "
    #nohup $DAEMON > /dev/null &
    nohup $DAEMON > server.log &
    echo $! > $PIDFILE
    echo "$NAME."
    ;;
stop)
    echo "Stopping $DESC: "
    pid=`cat $PIDFILE`
    kill $pid
    rm $PIDFILE
    echo "$NAME."
    ;;
esac
exit 0

