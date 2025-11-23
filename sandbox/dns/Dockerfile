FROM alpine:3.18

RUN apk add --no-cache dnsmasq

COPY dnsmasq.conf /etc/dnsmasq.conf
COPY entrypoint.sh /entrypoint.sh

RUN mkdir -p /etc/dnsmasq.d \
    && chmod +x /entrypoint.sh

USER nobody

ENTRYPOINT ["/entrypoint.sh"]

