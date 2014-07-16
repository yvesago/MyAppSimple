#! /bin/sh
### BEGIN INIT INFO
# Provides:          Meteor Environment
# Required-Start:    networking
# Required-Stop:     networking
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Meteor Environment
### END INIT INFO

NAME=myappsimple
RUN_AS=www-data
PID_FILE=/var/run/$NAME.pid
APP_DIR=/home/www/$NAME
CONFDIR=/etc/meteor
CONFFILE=Meteor.$NAME.settings
PORT=27000
ROOT_URL="http://myappserver.univ.org"
MONGO_URL='mongodb://localhost:27017/meteor'
 
set -e

NODEJS=node
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
DESC="Meteor server"
SCRIPTNAME=/etc/init.d/$NAME
CONF=`cat $CONFDIR/$CONFFILE` 
METEOR_SETTINGS=`echo "console.log(JSON.stringify($CONF));" | $NODEJS`

#
#       Function that starts the daemon/service.
#

d_start()
{
    # Starting node.js process, send log to /var/log/messages

    echo ""
    if [ -f $PID_FILE ]; then
        echo -n " already running"
    else
       start-stop-daemon --no-close --background --start --pidfile $PID_FILE \
            --make-pidfile --chuid $RUN_AS --chdir $APP_DIR \
            --exec /usr/bin/env ROOT_URL=$ROOT_URL MONGO_URL=$MONGO_URL \
            PORT=$PORT METEOR_SETTINGS="$METEOR_SETTINGS" -- \
             $NODEJS bundle/main.js 2>&1 | logger -i -t $NAME & 
    fi
}

#
#       Function that stops the daemon/service.
#

d_stop() {
    # Killing node.js process

    #echo -n ", $NAME"
    start-stop-daemon --stop --quiet --pidfile $PID_FILE \
                          || echo -n " not running"
    if [ -f $PID_FILE ]; then
        rm $PID_FILE
    fi
}

ACTION="$1"
case "$ACTION" in
    start)
        echo -n "Starting $DESC: $NAME"
        d_start
        echo "."
        ;;
    stop)
        echo -n "Stopping $DESC: $NAME"
        d_stop
        echo "."
        ;;
    restart|force-reload)
        echo -n "Restarting $DESC: $NAME"
        d_stop
        sleep 1
        d_start
        echo "."
        ;;
    *)
        echo "Usage: $NAME {start|stop|restart|force-reload}" >&2
        exit 3
        ;;
esac

exit 0
