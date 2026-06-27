import zipfile, os
apk='device_apk/installed.apk'
out='device_apk/classes10.dex'
with zipfile.ZipFile(apk,'r') as z:
    with open(out,'wb') as f:
        f.write(z.read('classes10.dex'))
print(out)
