#!/bin/sh
set -e

DEFAULT_BLOCKLIST="/etc/dnsmasq.d/blocklist.conf"

if [ ! -s "$DEFAULT_BLOCKLIST" ]; then
  echo "# empty blocklist - edit dns/blocklist.conf to add entries" > "$DEFAULT_BLOCKLIST"
fi

exec dnsmasq --keep-in-foreground --conf-file=/etc/dnsmasq.conf

