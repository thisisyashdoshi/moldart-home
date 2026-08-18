[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$unsafe = @(
    'ANTIQUE.pdf', 'HEAT PRINTED.pdf', 'HPL - OL - 2.pdf', 'INTRODUCTION TO MOLDART.pdf',
    'LPL - PET BOARD.pdf', 'MOSAIC.pdf', 'PRESS PLATE - SHUTTERING PLYWOOD.pdf', 'PROFILE.pdf',
    'STAMPED.pdf', 'WOOD - FLOORING.pdf', 'WOOD - FURNITURE - 1.pdf', 'WOOD - FURNITURE - 2.pdf'
)
$urls = @($unsafe | ForEach-Object { '/downloads/' + [Uri]::EscapeDataString($_).Replace('%2F', '/') })
$violations = [System.Collections.Generic.List[string]]::new()

foreach ($name in $unsafe) {
    if (Test-Path -LiteralPath (Join-Path $root "downloads\$name")) { $violations.Add("file remains: $name") }
}

$publicFiles = @(
    Get-Item -LiteralPath (Join-Path $root 'resources\index.html')
    Get-Item -LiteralPath (Join-Path $root 'public-site\resources\index.html')
    Get-Item -LiteralPath (Join-Path $root 'data\search-index.json')
    Get-Item -LiteralPath (Join-Path $root 'public-site\data\search-index.json')
    Get-ChildItem -LiteralPath (Join-Path $root 'products') -Recurse -Filter index.html -File
    Get-ChildItem -LiteralPath (Join-Path $root 'public-site\products') -Recurse -Filter index.html -File
)
foreach ($file in $publicFiles) {
    $text = [System.IO.File]::ReadAllText($file.FullName)
    foreach ($url in $urls) {
        if ($text.Contains($url, [StringComparison]::OrdinalIgnoreCase)) {
            $violations.Add("unsafe link remains in $([System.IO.Path]::GetRelativePath($root, $file.FullName)): $url")
        }
    }
    if ($text -match '<div class="resource-library-list[^>]*">\s*</div>') {
        $violations.Add("empty resource list remains in $([System.IO.Path]::GetRelativePath($root, $file.FullName))")
    }
}

foreach ($resourcePath in @((Join-Path $root 'resources\index.html'), (Join-Path $root 'public-site\resources\index.html'))) {
    $resourceText = [System.IO.File]::ReadAllText($resourcePath)
    $remaining = [regex]::Matches($resourceText, 'class="resource-library-row"').Count
    if ($resourceText -notmatch ('>' + $remaining + ' reviewed references remain available\.')) {
        $violations.Add("resource count is stale in $resourcePath")
    }
}

if ($violations.Count) { throw ($violations | ConvertTo-Json) }
[ordered]@{
    status = 'PASS'
    withdrawnPdfCount = $unsafe.Count
    filesScanned = $publicFiles.Count
    unsafeFilesRemaining = 0
    unsafeLinksRemaining = 0
    emptyResourceLists = 0
} | ConvertTo-Json
