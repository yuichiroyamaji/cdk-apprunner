FROM amazonlinux:2023

WORKDIR /srv/

# install git
RUN yum install -y git

# install pip
RUN curl -O https://bootstrap.pypa.io/get-pip.py && \
python3 get-pip.py --user && \
export PATH=/local/bin:$PATH && \
source /etc/skel/.bash_profile

# install mecab
RUN git clone --depth 1 https://github.com/taku910/mecab.git \
    && cd ./mecab/mecab \
    && yum install -y gcc-c++ \
    && if [ `uname -m` =  "aarch64" ]; then \
        ./configure --enable-utf8-only --with-charset=utf8 --build=arm-unknown-linux-gnu --host=arm-unknown-linux-gnu --target=arm-unknown-linux-gnu; \
    else \
        ./configure --enable-utf8-only --with-charset=utf8; \
    fi \
    && make \
    && make install
    
# compile mecab
WORKDIR /srv/mecab/mecab-ipadic
RUN ./configure --with-charset=utf8 --with-mecab-config=/usr/local/bin/mecab-config && \
make && make install

# install python mecab library
RUN python3 -m pip install mecab-python3