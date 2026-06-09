"""
Instagram Microservice — instagrapi + FastAPI
=============================================
Endpoints:
  POST /login           → Instagram'a giriş yap, session döndür
  POST /verify-code     → 2FA veya challenge kodu doğrula
  POST /send-dm         → DM gönder
  GET  /health          → Servis sağlıklı mı?
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from instagrapi import Client
from instagrapi.exceptions import (
    BadPassword,
    ChallengeRequired,
    LoginRequired,
    TwoFactorRequired,
    UserNotFound,
)
import json
import os
import uvicorn

app = FastAPI(title="Instagram Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Models ───────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str
    session_json: str | None = None  # Önceki session varsa yeniden kullan

class LoginResponse(BaseModel):
    success: bool
    session_json: str | None = None
    user_id: str | None = None
    full_name: str | None = None
    error: str | None = None
    challenge_required: bool = False
    two_factor_required: bool = False

class SendDMRequest(BaseModel):
    session_json: str
    recipient_user_id: str
    message: str

class SendDMResponse(BaseModel):
    success: bool
    thread_id: str | None = None
    error: str | None = None

class VerifyCodeRequest(BaseModel):
    session_json: str
    code: str
    challenge_type: str  # "sms" | "email" | "2fa"

# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "instagram-instagrapi"}

# ─── Login ────────────────────────────────────────────────────────────────────

@app.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    cl = Client()

    # Proxy desteği (opsiyonel)
    proxy = os.environ.get("INSTAGRAM_PROXY_URL")
    if proxy:
        cl.set_proxy(proxy)

    # Daha önce session varsa yükle (ban riskini azaltır)
    if req.session_json:
        try:
            session = json.loads(req.session_json)
            cl.set_settings(session)
            cl.get_timeline_feed()  # Session geçerli mi test et
            user_info = cl.account_info()
            return LoginResponse(
                success=True,
                session_json=json.dumps(cl.get_settings()),
                user_id=str(user_info.pk),
                full_name=user_info.full_name,
            )
        except Exception:
            pass  # Session expired, yeniden login

    try:
        cl.login(req.username, req.password)
        user_info = cl.account_info()
        return LoginResponse(
            success=True,
            session_json=json.dumps(cl.get_settings()),
            user_id=str(user_info.pk),
            full_name=user_info.full_name,
        )

    except TwoFactorRequired:
        return LoginResponse(
            success=False,
            session_json=json.dumps(cl.get_settings()),
            two_factor_required=True,
            error="Instagram iki faktörlü doğrulama kodu istedi.",
        )

    except ChallengeRequired:
        try:
            cl.challenge_resolve(cl.last_json)
        except Exception:
            pass
        return LoginResponse(
            success=False,
            session_json=json.dumps(cl.get_settings()),
            challenge_required=True,
            error="Instagram güvenlik doğrulaması istedi. Telefon/email kodunuzu girin.",
        )

    except BadPassword:
        raise HTTPException(status_code=400, detail="Kullanıcı adı veya şifre hatalı.")

    except UserNotFound:
        raise HTTPException(status_code=404, detail="Instagram kullanıcısı bulunamadı.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Verify Challenge / 2FA Code ──────────────────────────────────────────────

@app.post("/verify-code", response_model=LoginResponse)
async def verify_code(req: VerifyCodeRequest):
    cl = Client()
    proxy = os.environ.get("INSTAGRAM_PROXY_URL")
    if proxy:
        cl.set_proxy(proxy)

    try:
        session = json.loads(req.session_json)
        cl.set_settings(session)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Geçersiz session: {e}")

    try:
        if req.challenge_type == "2fa":
            cl.two_factor_login(req.code)
        else:
            cl.challenge_send_security_code(req.code)

        user_info = cl.account_info()
        return LoginResponse(
            success=True,
            session_json=json.dumps(cl.get_settings()),
            user_id=str(user_info.pk),
            full_name=user_info.full_name,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ─── Send DM ─────────────────────────────────────────────────────────────────

@app.post("/send-dm", response_model=SendDMResponse)
async def send_dm(req: SendDMRequest):
    cl = Client()
    proxy = os.environ.get("INSTAGRAM_PROXY_URL")
    if proxy:
        cl.set_proxy(proxy)

    try:
        session = json.loads(req.session_json)
        cl.set_settings(session)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Geçersiz session: {e}")

    try:
        thread = cl.direct_send(req.message, [int(req.recipient_user_id)])
        return SendDMResponse(success=True, thread_id=str(thread.id))
    except LoginRequired:
        raise HTTPException(status_code=401, detail="Session süresi dolmuş, yeniden giriş gerekli.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
