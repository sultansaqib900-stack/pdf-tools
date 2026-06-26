param(
  [string]$FilePath,
  [string]$ImportBlock,
  [string]$SchemaBlock
)

$content = Get-Content -LiteralPath $FilePath -Raw
$original = $content
$changed = $false

# --- ADD IMPORTS (if not already present) ---
if ($content -notmatch 'import HowToJsonLd from ') {
  $lines = $content -split "`r`n|`n"
  $lastImportIdx = -1
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^import ') { $lastImportIdx = $i }
  }
  if ($lastImportIdx -ge 0) {
    $newLines = @()
    for ($j = 0; $j -le $lastImportIdx; $j++) { $newLines += $lines[$j] }
    $newLines += ""
    $newLines += $ImportBlock.TrimEnd()
    for ($j = $lastImportIdx + 1; $j -lt $lines.Count; $j++) { $newLines += $lines[$j] }
    $content = $newLines -join "`r`n"
    $changed = $true
  }
}

# --- ADD SCHEMA JSX TAGS (if not already present) ---
if ($content -notmatch '<HowToJsonLd ') {
  # Look for BreadcrumbJsonLd closing tag (inline or multiline)
  $pattern = '(?s)<BreadcrumbJsonLd[^>]*/>'
  $match = [regex]::Match($content, $pattern)
  if (-not $match.Success) {
    # Try multiline BreadcrumbJsonLd: find closing </BreadcrumbJsonLd>
    $closingMatch = [regex]::Match($content, '(?s)</BreadcrumbJsonLd>')
    if ($closingMatch.Success) { $match = $closingMatch }
  }
  if ($match.Success) {
    $afterEnd = $match.Index + $match.Length
    $content = $content.Substring(0, $afterEnd) + "`r`n      " + $SchemaBlock.TrimEnd() + $content.Substring($afterEnd)
    $changed = $true
  } else {
    # Fallback: try self-closing SoftwareAppJsonLd
    $match2 = [regex]::Match($content, '(?s)<SoftwareAppJsonLd[^>]*/>')
    if ($match2.Success) {
      $afterEnd = $match2.Index + $match2.Length
      $content = $content.Substring(0, $afterEnd) + "`r`n      " + $SchemaBlock.TrimEnd() + $content.Substring($afterEnd)
      $changed = $true
    } else {
      # Fallback: try multiline SoftwareAppJsonLd (last closing tag)
      $matches3 = [regex]::Matches($content, '(?s)</SoftwareAppJsonLd>')
      if ($matches3.Count -gt 0) {
        $match3 = $matches3[$matches3.Count - 1]
        $afterEnd = $match3.Index + $match3.Length
        $content = $content.Substring(0, $afterEnd) + "`r`n      " + $SchemaBlock.TrimEnd() + $content.Substring($afterEnd)
        $changed = $true
      }
    }
  }
}

if ($changed) {
  Set-Content -LiteralPath $FilePath -Value $content -NoNewline
  Write-Host "Updated: $FilePath"
} else {
  Write-Host "Skipped (already up to date): $FilePath"
}
