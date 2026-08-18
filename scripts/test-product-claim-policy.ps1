[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$files = @(
    Get-Item -LiteralPath (Join-Path $root 'data\product-directory.json')
    Get-ChildItem -LiteralPath (Join-Path $root 'products') -Recurse -Filter index.html -File
    Get-ChildItem -LiteralPath (Join-Path $root 'public-site\products') -Recurse -Filter index.html -File
)
$blocked = [ordered]@{
    hardness = '(?i)\bHRC\b'
    density = '(?i)\b\d[\d,]*(?:[–-]\d[\d,]*)?\s*kg/m(?:³|3)\b'
    cycles = '(?i)\b\d[\d,]*(?:[–-]\d[\d,]*)?\s*cycles\b'
    micrometre = '(?i)\b(?:Ra\s*)?\d+(?:\.\d+)?(?:[–-]\d+(?:\.\d+)?)?\s*(?:μm|um)\b'
    gsm = '(?i)\b\d+(?:[–-]\d+)?\s*GSM\b'
    strength = '\b(?:(?i:above)\s*)?\d+(?:\.\d+)?\s*(?:MPa|N/mm²|N)\b'
    tolerance = '(?i)(?:±\s*\d+(?:\.\d+)?\s*mm|below\s*\d+(?:\.\d+)?\s*mm/m)'
    wearClass = '(?i)\bAC[3-5](?:[–-]AC[3-5])?\b'
    unsupportedStandard = '(?i)\bEN\s*13329\b'
    unsupportedPercent = '(?i)\b(?:above|below)\s*\d+(?:\.\d+)?%'
    numericThickness = '(?i)\bThickness:\s*\d+(?:[–-]\d+)?\s*mm'
    numericWidth = '(?i)\bMaximum width:\s*\d+(?:\.\d+)?\s*mm'
    unverifiedGrade = '(?i)\b(?:SS|SUS)\s*(?:201|301|304|316|420|430|630)\b'
}

$violations = [System.Collections.Generic.List[object]]::new()
foreach ($file in $files) {
    $text = [System.IO.File]::ReadAllText($file.FullName)
    foreach ($entry in $blocked.GetEnumerator()) {
        $matches = [regex]::Matches($text, [string]$entry.Value)
        if ($matches.Count) {
            $violations.Add([ordered]@{
                file = [System.IO.Path]::GetRelativePath($root, $file.FullName)
                rule = [string]$entry.Key
                count = $matches.Count
                examples = @($matches.Value | Select-Object -Unique)
            })
        }
    }
}

$data = Get-Content -LiteralPath (Join-Path $root 'data\product-directory.json') -Raw | ConvertFrom-Json -Depth 100
foreach ($product in @($data.products)) {
    if (@($product.specs).Count -ne 4) { throw "Product $($product.id) does not have exactly four buyer inputs." }
    if (@($product.technical.grades) -cne @('Confirm against the approved supplier record')) { throw "Product $($product.id) exposes unverified grades." }
    if (@($product.technical.certifications).Count -ne 0) { throw "Product $($product.id) exposes an unverified certification." }
    if ($product.technical.origin -cne 'Programme-dependent') { throw "Product $($product.id) exposes an unverified origin." }
}
$aliases = [ordered]@{
    'products\decor-paper\index.html' = 'https://moldartindia.com/products/printed-decor-paper/'
    'products\decorative-panels\index.html' = 'https://moldartindia.com/products/decorative-ss-panels/'
}
foreach ($entry in $aliases.GetEnumerator()) {
    $aliasPath = Join-Path $root ([string]$entry.Key)
    $aliasText = [System.IO.File]::ReadAllText($aliasPath)
    if ($aliasText -notmatch '<meta name="robots" content="noindex, follow">') { throw "$($entry.Key) is not noindex." }
    if (-not $aliasText.Contains('<link rel="canonical" href="' + [string]$entry.Value + '">', [StringComparison]::Ordinal)) { throw "$($entry.Key) has the wrong canonical target." }
    if ($aliasText -match '"@type"\s*:\s*"Product"') { throw "$($entry.Key) still exposes a duplicate Product schema." }
}
foreach ($redirectPath in @((Join-Path $root '_redirects'), (Join-Path $root 'public-site\_redirects'))) {
    $redirectText = [System.IO.File]::ReadAllText($redirectPath)
    foreach ($alias in @('/products/decor-paper', '/products/decorative-panels')) {
        if (-not $redirectText.Contains($alias, [StringComparison]::Ordinal)) { throw "$redirectPath is missing $alias." }
    }
}
if ($violations.Count) { throw ($violations | ConvertTo-Json -Depth 8) }

[ordered]@{
    status = 'PASS'
    products = @($data.products).Count
    filesScanned = $files.Count
    blockedClaimClasses = $blocked.Count
    canonicalRedirectAliases = $aliases.Count
    violations = 0
} | ConvertTo-Json
