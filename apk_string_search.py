import zipfile, os
apk='device_apk/installed.apk'
if not os.path.exists(apk):
    raise SystemExit('APK missing')
with zipfile.ZipFile(apk, 'r') as z:
    names=z.namelist()
    dex=[n for n in names if n.endswith('.dex')]
    print('DEX_COUNT', len(dex))
    for term in [b'OPERACION ACTIVA', 'OPERACIÓN ACTIVA'.encode('utf-8'), b'pedidos_en_camino', b'com.nelly.driver', b'com.example.nellydriver']:
        print('TERM', term)
        found=False
        for entry in dex:
            data=z.read(entry)
            idx=data.lower().find(term.lower())
            if idx!=-1:
                found=True
                start=max(0, idx-60)
                end=min(len(data), idx+len(term)+60)
                snippet=data[start:end]
                print('FOUND IN', entry, 'offset', idx)
                try:
                    print(snippet.decode('utf-8', errors='replace'))
                except Exception as e:
                    print('DECODE ERROR', e)
                break
        if not found:
            print('NOT FOUND IN DEX')
    print('--- RESOURCE ARSC ---')
    if 'resources.arsc' in names:
        data=z.read('resources.arsc')
        for term in [b'OPERACION', 'OPERACIÓN'.encode('utf-8'), b'pedidos_en_camino']:
            idx=data.lower().find(term.lower())
            if idx!=-1:
                print('RES FOUND', term, 'offset', idx)
                start=max(0, idx-60)
                end=min(len(data), idx+len(term)+60)
                print(data[start:end].decode('utf-8', errors='replace'))
            else:
                print('RES NOT FOUND', term)
