import zipfile, os, hashlib
apk='device_apk/installed.apk'
print('APK_PATH', os.path.abspath(apk))
print('SIZE', os.path.getsize(apk))
print('SHA256', hashlib.sha256(open(apk,'rb').read()).hexdigest())
with zipfile.ZipFile(apk,'r') as z:
    names=z.namelist()
    dex_files=[n for n in names if n.endswith('.dex')]
    print('DEX_FILES', dex_files)
    print('RESOURCE_FILES', [n for n in names if n.endswith(('.xml','.arsc'))])
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
    print('--- DEX STRING CHECK ---')
    for entry in dex_files:
        data=z.read(entry)
        for t in [b'OPERACI\xc3\x93N ACTIVA', b'OPERACION ACTIVA', b'operacion activa', b'pedidos_en_camino', b'com.nelly.driver', b'com.example.nellydriver', b'com.example.nelly', b'com.example.nelly2']:
            if t.lower() in data.lower():
                print('DEX_FOUND', entry, t.decode('latin1', 'ignore'))
    print('--- BIN MATCH ---')
    bin_data=open(apk,'rb').read()
    for s in [b'package:com.nelly.driver', b'package:com.example.nellydriver', b'package:com.example.nelly', b'package:com.example.nelly2', b'com.nelly.driver', b'com.example.nellydriver', b'com.example.nelly', b'com.example.nelly2']:
        if s in bin_data:
            print('BIN_MATCH', s.decode('latin1'))
