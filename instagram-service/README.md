# Instagram Service

Bu klasör `instagrapi` tabanlı Python FastAPI mikroservisini içerir.

## Kurulum

```bash
cd instagram-service

# Sanal ortam oluştur
python -m venv venv

# Windows'ta aktif et
venv\Scripts\activate

# Bağımlılıkları yükle
pip install -r requirements.txt

# Servisi başlat (port 8001)
python main.py
```

## Ortam Değişkenleri

```
PORT=8001                          # (opsiyonel, varsayılan: 8001)
INSTAGRAM_PROXY_URL=socks5://...  # (opsiyonel, ban önleme için)
```

## Endpoints

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/health` | Servis durumu |
| POST | `/login` | Instagram girişi |
| POST | `/verify-code` | 2FA / Challenge kodu |
| POST | `/send-dm` | DM gönder |

## Next.js'ten kullanım

`.env.local` dosyasına ekle:
```
INSTAGRAM_SERVICE_URL=http://localhost:8001
```
