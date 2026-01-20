FROM ubuntu

# 1. Update apt and install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    nodejs \
    git \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Streamlink using the new pip method
# We use --break-system-packages to install it globally in this container environment.
RUN pip3 install -U streamlink --break-system-packages

# 3. Setup workspace
RUN mkdir /streamproxyprj
WORKDIR /streamproxyprj

# 4. Clone the repository
RUN git clone https://github.com/asabino2/streamproxy.git

# 5. Set working directory for execution
WORKDIR /streamproxyprj/streamproxy

# 6. Expose port and define start command
EXPOSE 4211
CMD node ./src/main.js