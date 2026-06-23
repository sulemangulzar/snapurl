from contextlib import asynccontextmanager
from reprlib import aRepr

from fastapi import FastAPI, Response

from app.api.routes import url, user
from app.database import create_all_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_all_tables()
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(user.router)
app.include_router(url.router)


@app.get("/")
def health():
    return Response("healthy")
