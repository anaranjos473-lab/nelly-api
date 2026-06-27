import zipfile, os
apk='device_apk/installed.apk'
with zipfile.ZipFile(apk,'r') as z:
    data=z.read('classes10.dex')
    idx=data.lower().find('operación activa'.encode('utf-8'))
    print('OPERACION_ACTIVA_INDEX', idx)
    if idx != -1:
        start=max(0, idx-200)
        end=min(len(data), idx+len('OPERACIÓN ACTIVA'.encode('utf-8'))+200)
        snippet=data[start:end]
        print(snippet.decode('utf-8', errors='replace'))
    idx2=data.lower().find(b'pedidos_en_camino')
    print('PEDIDOS_EN_CAMINO_INDEX', idx2)
    if idx2 != -1:
        start=max(0, idx2-200)
        end=min(len(data), idx2+len(b'pedidos_en_camino')+200)
        snippet2=data[start:end]
        print(snippet2.decode('utf-8', errors='replace'))
