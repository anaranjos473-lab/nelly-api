import zipfile, os, hashlib
apks=[('installed','device_apk/installed.apk'),('local','C:/Users/hp14/AndroidStudioProjects/NellyDriver/app/build/outputs/apk/release/app-release.apk')]
for label,path in apks:
    print('===', label, '===')
    if not os.path.exists(path):
        print('MISSING', path)
        continue
    with open(path,'rb') as f:
        data=f.read()
    print('SHA256', hashlib.sha256(data).hexdigest())
    with zipfile.ZipFile(path,'r') as z:
        names=z.namelist()
        print('FILES', len(names), 'DEX', sum(1 for n in names if n.endswith('.dex')))
        terms=[b'OPERACI', b'operacion', b'operaci\xc3\xb3n', b'PEDIDOS_EN_CAMINO', b'pedidos_en_camino', b'com.nelly.driver', b'com.example.nellydriver', b'com.example.nelly', b'com.example.nelly2']
        found=set()
        for entry in names:
            if entry.endswith(('.dex','.xml','.arsc')):
                data=z.read(entry)
                lower=data.lower()
                for t in terms:
                    if t.lower() in lower:
                        found.add((entry,t.decode('latin1')))
        for item in sorted(found):
            print('FOUND', item)
        print('---')
        if label=='installed':
            print('resource strings sample')
            for res in names:
                if res.endswith('strings.xml') or res.endswith('resources.arsc'):
                    print('RES', res)
        if label=='local':
            print('local apk package sample entries')
            for res in ['AndroidManifest.xml','classes.dex','classes10.dex','classes12.dex']:
                if res in names:
                    print('HAS', res)
print('=== END ===')
