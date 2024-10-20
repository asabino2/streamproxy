FROM --platform="linux/arm64" ubuntu
RUN apt-get update
RUN apt install software-properties-common -y
RUN add-apt-repository ppa:nilarimogard/webupd8 -y
RUN apt-get update >> /tmp/update.txt 2>&1; awk '( /W:/ && /launchpad/ && /404/ ) { print substr($5,26) }' /tmp/update.txt > /tmp/awk.txt; awk -F '/' '{ print $1"/"$2 }' /tmp/awk.txt > /tmp/awk1.txt; uniq /tmp/awk1.txt > /tmp/awk2.txt
RUN apt install streamlink -y
#ADD ./resources/streamproxy /usr/bin/streamproxy
ADD ./resources/streamproxy-arm64 /usr/bin/streamproxy
#ADD ./resources/runstreamproxy.sh /usr/bin/runstreamproxy.sh
#RUN cd /usr/bin
#RUN apt-get install curl -y
#RUN curl https://github.com/asabino2/streamproxy/releases/download/streamproxy-latest/streamproxy -O
#RUN apt-get remove curl -y
#ADD ./resources/config.json /usr/bin/streamproxyconfig.json
RUN chmod +x /usr/bin/streamproxy
#RUN chmod +x /usr/bin/streamproxy-arm64
#RUN chmod +x /usr/bin/runstreamproxy.sh
EXPOSE 4211
CMD streamproxy
#CMD /usr/bin/runstreamproxy.sh
#CMD ["bash"]
FROM --platform="linux/amd64" ubuntu
RUN apt-get update
RUN apt install software-properties-common -y
RUN add-apt-repository ppa:nilarimogard/webupd8 -y
RUN apt-get update >> /tmp/update.txt 2>&1; awk '( /W:/ && /launchpad/ && /404/ ) { print substr($5,26) }' /tmp/update.txt > /tmp/awk.txt; awk -F '/' '{ print $1"/"$2 }' /tmp/awk.txt > /tmp/awk1.txt; uniq /tmp/awk1.txt > /tmp/awk2.txt
RUN apt install streamlink -y
ADD ./resources/streamproxy /usr/bin/streamproxy
#ADD ./resources/streamproxy-arm64 /usr/bin/streamproxy
#ADD ./resources/runstreamproxy.sh /usr/bin/runstreamproxy.sh
#RUN cd /usr/bin
#RUN apt-get install curl -y
#RUN curl https://github.com/asabino2/streamproxy/releases/download/streamproxy-latest/streamproxy -O
#RUN apt-get remove curl -y
#ADD ./resources/config.json /usr/bin/streamproxyconfig.json
RUN chmod +x /usr/bin/streamproxy
#RUN chmod +x /usr/bin/streamproxy-arm64
#RUN chmod +x /usr/bin/runstreamproxy.sh
EXPOSE 4211
CMD streamproxy
#CMD /usr/bin/runstreamproxy.sh
#CMD ["bash"]