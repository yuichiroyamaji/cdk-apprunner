import uvicorn
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import sys
import MeCab

app = FastAPI()
mecab = MeCab.Tagger("-u /srv/mecab/mecab-userdic/user.dic")  

@app.get("/")
def root(address: str):
    res = mecab.parse(address)
    return JSONResponse(content=res.split('\n'), headers={"Content-type":"application/json; charset=utf-8"})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
