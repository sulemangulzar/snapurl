import io

import qrcode
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.dependencies import UrlServiceDep, get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/urls/{short_code}/qr")
async def get_url_qr(
    short_code: str,
    service: UrlServiceDep,
    current_user: User = Depends(get_current_user)
):
    # Ensure user owns the URL
    url = await service.get_url(short_code, current_user.id)
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")

    # Generate QR Code
    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(url.original_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save to BytesIO
    buf = io.BytesIO()
    img.save(buf, kind="PNG")
    buf.seek(0)
    
    return StreamingResponse(buf, media_type="image/png")
