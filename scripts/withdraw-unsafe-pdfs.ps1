[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$downloadRoot = [System.IO.Path]::GetFullPath((Join-Path $root 'downloads'))
$unsafe = @(
    'ANTIQUE.pdf',
    'HEAT PRINTED.pdf',
    'HPL - OL - 2.pdf',
    'INTRODUCTION TO MOLDART.pdf',
    'LPL - PET BOARD.pdf',
    'MOSAIC.pdf',
    'PRESS PLATE - SHUTTERING PLYWOOD.pdf',
    'PROFILE.pdf',
    'STAMPED.pdf',
    'WOOD - FLOORING.pdf',
    'WOOD - FURNITURE - 1.pdf',
    'WOOD - FURNITURE - 2.pdf'
)

$urls = @($unsafe | ForEach-Object { '/downloads/' + [Uri]::EscapeDataString($_).Replace('%2F', '/') })
$htmlFiles = @(
    Get-Item -LiteralPath (Join-Path $root 'resources\index.html')
    Get-Item -LiteralPath (Join-Path $root 'public-site\resources\index.html')
    Get-ChildItem -LiteralPath (Join-Path $root 'products') -Recurse -Filter index.html -File
    Get-ChildItem -LiteralPath (Join-Path $root 'public-site\products') -Recurse -Filter index.html -File
)

$changedHtml = 0
foreach ($file in $htmlFiles) {
    $before = [System.IO.File]::ReadAllText($file.FullName)
    $after = $before
    foreach ($url in $urls) {
        $escaped = [regex]::Escape($url)
        $after = [regex]::Replace(
            $after,
            '<a\b(?=[^>]*\bhref=["'']' + $escaped + '["''])[^>]*>.*?</a>',
            '',
            [System.Text.RegularExpressions.RegexOptions]::Singleline -bor [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
        )
    }
    $after = [regex]::Replace(
        $after,
        '<div class="resource-library-list resource-library-list-compact mt-6">\s*</div>',
        '<div class="resource-library-list resource-library-list-compact mt-6"><p class="ui-data-note">No public document is currently cleared for this route. Request a specification review.</p></div>',
        [System.Text.RegularExpressions.RegexOptions]::Singleline
    )
    if ($file.FullName -match '[\\/]resources[\\/]index\.html$') {
        $after = [regex]::Replace(
            $after,
            '<article\b[^>]*class="ui-resource-card fade-up"[^>]*>.*?</article>',
            {
                param($match)
                $article = $match.Value
                $count = [regex]::Matches($article, 'class="resource-library-row"').Count
                if ($count -eq 0) { return '' }
                return [regex]::Replace($article, '<span class="ui-resource-count">\d+</span>', '<span class="ui-resource-count">' + $count + '</span>')
            },
            [System.Text.RegularExpressions.RegexOptions]::Singleline
        )
        $remaining = [regex]::Matches($after, 'class="resource-library-row"').Count
        $after = [regex]::Replace(
            $after,
            '<div class="ui-resource-library-note">.*?</div>',
            '<div class="ui-resource-library-note">' + $remaining + ' reviewed references remain available. Documents on identity or evidence hold have been withdrawn until corrected.</div>',
            [System.Text.RegularExpressions.RegexOptions]::Singleline
        )
    }
    $after = [regex]::Replace($after, '(?m)^[ \t]+(?=\r?$)', '')
    if ($after -cne $before) {
        [System.IO.File]::WriteAllText($file.FullName, $after, [System.Text.UTF8Encoding]::new($false))
        $changedHtml++
    }
}

$changedIndexes = 0
foreach ($searchPath in @((Join-Path $root 'data\search-index.json'), (Join-Path $root 'public-site\data\search-index.json'))) {
    $before = Get-Content -LiteralPath $searchPath -Raw | ConvertFrom-Json -Depth 100
    $after = @($before | Where-Object { [string]$_.url -notin $urls })
    if ($after.Count -ne @($before).Count) {
        [System.IO.File]::WriteAllText($searchPath, (($after | ConvertTo-Json -Depth 100 -Compress) + [Environment]::NewLine), [System.Text.UTF8Encoding]::new($false))
        $changedIndexes++
    }
}

$removed = 0
foreach ($name in $unsafe) {
    $path = [System.IO.Path]::GetFullPath((Join-Path $downloadRoot $name))
    if (-not $path.StartsWith($downloadRoot + [System.IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Unsafe PDF target escaped downloads: $name"
    }
    if (Test-Path -LiteralPath $path) {
        Remove-Item -LiteralPath $path -Force
        $removed++
    }
}

[ordered]@{
    status = 'PASS'
    policy = 'Owner-confirmed false manufacturer identity is withdrawn; replacements require corrected evidence and approval.'
    unsafePdfCount = $unsafe.Count
    removedFiles = $removed
    htmlFilesChanged = $changedHtml
    searchIndexesChanged = $changedIndexes
} | ConvertTo-Json
