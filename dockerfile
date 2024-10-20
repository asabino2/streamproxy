FROM --platform="linux/arm64" ubuntu
RUN apt-get update
RUN apt install software-properties-common -y
RUN add-apt-repository ppa:nilarimogard/webupd8 -y
RUN apt-get update >> /tmp/update.txt 2>&1; awk '( /W:/ && /launchpad/ && /404/ ) { print substr($5,26) }' /tmp/update.txt > /tmp/awk.txt; awk -F '/' '{ print $1"/"$2 }' /tmp/awk.txt > /tmp/awk1.txt; uniq /tmp/awk1.txt > /tmp/awk2.txt
RUN apt install streamlink -y
#ADD ./resources/streamproxy /usr/bin/streamproxy
ADD ./bin/linux-arm64/streamproxy-arm64 /usr/bin/streamproxy
RUN chmod +x /usr/bin/streamproxy
EXPOSE 4211
CMD streamproxy

FROM --platform="linux/amd64" ubuntu
RUN apt-get update
RUN apt install software-properties-common -y
RUN add-apt-repository ppa:nilarimogard/webupd8 -y
RUN apt-get update >> /tmp/update.txt 2>&1; awk '( /W:/ && /launchpad/ && /404/ ) { print substr($5,26) }' /tmp/update.txt > /tmp/awk.txt; awk -F '/' '{ print $1"/"$2 }' /tmp/awk.txt > /tmp/awk1.txt; uniq /tmp/awk1.txt > /tmp/awk2.txt
RUN apt install streamlink -y
ADD ./bin/linux-x64/streamproxy /usr/bin/streamproxy
RUN chmod +x /usr/bin/streamproxy
EXPOSE 4211
CMD streamproxy
