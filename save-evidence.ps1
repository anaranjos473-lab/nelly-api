$output = & node '.codex-tmp/certify-ped-test-real.mjs' 2>&1 | Out-String
$outputStr = [string]$output

# Buscar el primer {
$idx = $outputStr.IndexOf('{')
if ($idx -ge 0) {
    $json = $outputStr.Substring($idx)
    # Buscar el último }
    $lastIdx = $json.LastIndexOf('}')
    if ($lastIdx -ge 0) {
        $json = $json.Substring(0, $lastIdx + 1)
        $json | Out-File -Encoding UTF8 'PED_TEST_REAL_001_EVIDENCIA.json'
        Write-Host "Evidence saved"
    }
} else {
    Write-Host "No JSON found"
}

