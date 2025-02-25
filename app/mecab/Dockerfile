FROM 588907989152.dkr.ecr.ap-northeast-1.amazonaws.com/mecab-base-image:latest

COPY main.py /srv/

# install fastapi, uvicorn
RUN python3 -m pip install fastapi uvicorn

# copy user.dic
WORKDIR /srv/mecab/
RUN mkdir mecab-userdic
COPY user.dic /srv/mecab/mecab-userdic

# start fastapi app
WORKDIR /srv/
CMD ["uvicorn", "main:app", "--host=0.0.0.0", "--reload"]