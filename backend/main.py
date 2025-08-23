import os
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from app import create_app
from app.middlewares.auth_middleware import auth_middleware
from app.utils.database import Base, engine
from app.utils.logger import logger

app = create_app()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.middleware("http")(auth_middleware)

port = int(os.getenv("PORT", 8000))

def run_dev_server():
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

def run_prod_server():
    uvicorn.run(app, host="0.0.0.0", port=port)

@app.on_event("startup")
def startup():
    try:
        Base.metadata.create_all(bind=engine, checkfirst=True)
    except Exception as e:
        logger.warning(f"Warning: Error during table creation: {e}")

if __name__ == "__main__":
    if os.getenv("DEV_MODE", "true").lower() == "true":
        run_dev_server()
    else:
        run_prod_server()