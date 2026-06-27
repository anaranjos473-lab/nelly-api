$lines=Get-Content classes10_dexdump.txt
$targets = @("pedidos_en_camino/","OPERACI")
foreach($t in $targets){
  Write-Output "=== $t ==="
  for($i=0;$i -lt $lines.Count;$i++){
    if($lines[$i].Contains($t)){
      Write-Output "match line $($i+1): $($lines[$i])"
      $found=0
      for($j=$i-1;$j -ge 0;$j--){
        if($lines[$j] -match 'Class descriptor  : |name\s+: |method |type\s+:' ){
          Write-Output "  prev[$($j+1)] $($lines[$j])"
          if($lines[$j] -match 'Class descriptor  : '){ $found=1; break }
        }
      }
      if(-not $found){ Write-Output '  no class found above' }
      break
    }
  }
}
