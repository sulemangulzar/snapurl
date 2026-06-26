import time
import qrcode
import io

t0 = time.time()
qr = qrcode.QRCode(version=1, box_size=10, border=2)
qr.add_data("https://google.com")
qr.make(fit=True)
img = qr.make_image(fill_color="black", back_color="white")
buf = io.BytesIO()
img.save(buf, format="PNG")
buf.seek(0)
print(f"Time taken: {time.time() - t0:.4f} seconds")
