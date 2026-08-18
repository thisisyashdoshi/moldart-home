[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$dataPaths = @(
    (Join-Path $root 'data\product-directory.json'),
    (Join-Path $root 'public-site\data\product-directory.json')
)
$data = Get-Content -LiteralPath $dataPaths[0] -Raw | ConvertFrom-Json -Depth 100

$safe = [ordered]@{
    'press-plates' = @('Application and pressed product', 'Press type, stack position, and working size', 'Approved surface reference and acceptance method', 'Grade, coating, quantity, and timing confirmed per programme')
    'press-pads' = @('Press and application', 'Stack position and working size', 'Construction and process window', 'Quantity, acceptance method, and timing confirmed per programme')
    'engraved-cylinders' = @('Printing process and substrate', 'Artwork, repeat, and colour-separation files', 'Cylinder dimensions and quantity', 'Engraving and acceptance criteria confirmed against the approved record')
    'decor-paper' = @('End use and substrate', 'Decor and colour reference', 'Width, repeat, and quantity', 'Master and batch approval basis')
    'plywood' = @('Application and load context', 'Panel dimensions and quantity', 'Face and core requirement', 'Acceptance and document requirements')
    'fiberboard' = @('Application and conversion process', 'Panel dimensions and quantity', 'Machining or surface route', 'Acceptance and packing requirements')
    'wood-flooring' = @('Application and installation context', 'Construction and dimensions', 'Finish reference and approved sample', 'Quantity, destination, and timing')
    'custom-furniture' = @('Approved layout and application', 'Material and construction schedule', 'Finish reference and hardware scope', 'Quantity, destination, installation, and timing')
    'osb' = @('Application and load context', 'Panel dimensions and quantity', 'Environmental exposure', 'Acceptance and document requirements')
    'particleboard' = @('Application', 'Panel dimensions and quantity', 'Surface or facing route', 'Machining and acceptance requirements')
    'flooring-accessories' = @('Flooring system and installation context', 'Profile purpose and section', 'Finish or decor reference', 'Length, quantity, destination, and timing')
    'ready-made-furniture' = @('Application and approved model', 'Material and construction schedule', 'Finish, hardware, and packing requirement', 'Quantity, destination, assembly, and timing')
    'decorative-panels' = @('Application and substrate', 'Approved finish sample', 'Grade, thickness, and dimensions', 'Direction, edge, and batch-continuity requirements')
    'ss-profiles' = @('Profile purpose', 'Approved section drawing', 'Finish and direction', 'Length, quantity, and installation context')
    'ss-furniture' = @('Application and approved design', 'Structure and material schedule', 'Finish reference and top material', 'Quantity, destination, installation, and timing')
    'industrial-press-plates' = @('Application and exact tooling role', 'Current drawing revision', 'Dimensions, quantity, and timing', 'Inspection, handling, and packing requirements')
}

$literalReplacements = [ordered]@{}
foreach ($product in @($data.products)) {
    if (-not $safe.Contains([string]$product.id)) { throw "Missing safe policy for $($product.id)." }
    $oldSpecs = @($product.specs)
    $newSpecs = @($safe[[string]$product.id])
    if ($oldSpecs.Count -ne 4 -or $newSpecs.Count -ne 4) { throw "Expected four specification lines for $($product.id)." }
    for ($i = 0; $i -lt 4; $i++) {
        if ($oldSpecs[$i] -cne $newSpecs[$i]) { $literalReplacements[[string]$oldSpecs[$i]] = [string]$newSpecs[$i] }
    }
    $product.specs = $newSpecs
    $product.technical.grades = @('Confirm against the approved supplier record')
    $product.technical.certifications = @()
    $product.technical.origin = 'Programme-dependent'
}

$json = $data | ConvertTo-Json -Depth 100
foreach ($dataPath in $dataPaths) {
    [System.IO.File]::WriteAllText($dataPath, $json + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
}

$blockedSearchPatterns = @(
    '(?i)\bHRC\b',
    '(?i)\b\d[\d,]*(?:[–-]\d[\d,]*)?\s*kg/m(?:³|3)\b',
    '(?i)\b\d[\d,]*(?:[–-]\d[\d,]*)?\s*cycles\b',
    '(?i)\b(?:Ra\s*)?\d+(?:\.\d+)?(?:[–-]\d+(?:\.\d+)?)?\s*(?:μm|um)\b',
    '(?i)\b\d+(?:[–-]\d+)?\s*GSM\b',
    '(?i)\b(?:(?:above)\s*)?\d+(?:\.\d+)?\s*(?:MPa|N/mm²|N)\b',
    '(?i)(?:±\s*\d+(?:\.\d+)?\s*mm|below\s*\d+(?:\.\d+)?\s*mm/m)',
    '(?i)\bAC[3-5](?:[–-]AC[3-5])?\b',
    '(?i)\bEN\s*13329\b',
    '(?i)\b(?:above|below)\s*\d+(?:\.\d+)?%',
    '(?i)\bThickness:\s*\d+(?:[–-]\d+)?\s*mm',
    '(?i)\bMaximum width:\s*\d+(?:\.\d+)?\s*mm',
    '(?i)\b(?:SS|SUS)\s*(?:201|301|304|316|420|430|630)\b',
    '(?i)\b(?:E1|E0|CARB-NAF|F4 star|TSCA Title VI)\b'
)
$searchPaths = @(
    (Join-Path $root 'data\search-index.json'),
    (Join-Path $root 'public-site\data\search-index.json')
)
foreach ($searchPath in $searchPaths) {
    $search = Get-Content -LiteralPath $searchPath -Raw | ConvertFrom-Json -Depth 100
    foreach ($item in @($search)) {
        if (@($blockedSearchPatterns | Where-Object { [string]$item.meta -match $_ }).Count) { $item.meta = 'Specification review inputs' }
        $item.keywords = @($item.keywords | Where-Object {
            $keyword = [string]$_
            @($blockedSearchPatterns | Where-Object { $keyword -match $_ }).Count -eq 0
        })
    }
    [System.IO.File]::WriteAllText($searchPath, (($search | ConvertTo-Json -Depth 100 -Compress) + [Environment]::NewLine), [System.Text.UTF8Encoding]::new($false))
}

$htmlFiles = @(
    Get-ChildItem -LiteralPath (Join-Path $root 'products') -Recurse -Filter index.html -File
    Get-ChildItem -LiteralPath (Join-Path $root 'public-site\products') -Recurse -Filter index.html -File
)
$changed = 0
foreach ($file in $htmlFiles) {
    $before = [System.IO.File]::ReadAllText($file.FullName)
    $after = $before
    foreach ($entry in $literalReplacements.GetEnumerator()) {
        $after = $after.Replace([string]$entry.Key, [string]$entry.Value)
    }
    $route = $file.Directory.Name
    $policyId = switch ($route) {
        'printed-decor-paper' { 'decor-paper' }
        'decorative-ss-panels' { 'decorative-panels' }
        default { $route }
    }
    if ($safe.Contains($policyId)) {
        $inputs = @($safe[$policyId])
        $keyChecks = '<div class="ui-data-label">Key checks</div>' + [Environment]::NewLine +
            '                            <div class="ui-data-value">' + [System.Net.WebUtility]::HtmlEncode($inputs[0]) + '</div>' + [Environment]::NewLine +
            '                            <p class="ui-data-note">' + [System.Net.WebUtility]::HtmlEncode($inputs[1]) + ' • ' + [System.Net.WebUtility]::HtmlEncode($inputs[2]) + '</p>'
        $after = [regex]::Replace(
            $after,
            '<div class="ui-data-label">Key checks</div>\s*<div class="ui-data-value">.*?</div>\s*<p class="ui-data-note">.*?</p>',
            $keyChecks,
            [System.Text.RegularExpressions.RegexOptions]::Singleline
        )
        $rows = for ($i = 0; $i -lt $inputs.Count; $i++) {
            '<tr><td>Buyer input ' + ($i + 1) + '</td><td>' + [System.Net.WebUtility]::HtmlEncode($inputs[$i]) + '</td></tr>'
        }
        $rows += '<tr><td>Exact specifications</td><td>Confirm against the approved supplier record</td></tr>'
        $rows += '<tr><td>Reference standard</td><td>Confirm against the approved supplier record</td></tr>'
        $rows += '<tr><td>Supply route</td><td>Programme-dependent</td></tr>'
        $rows += '<tr><td>Commercial schedule</td><td>On request</td></tr>'
        $tableBody = '<tr><th>Reference</th><th>Details</th></tr>' + [Environment]::NewLine + '                        ' + ($rows -join '')
        $after = [regex]::Replace(
            $after,
            '<tr><th>Reference</th><th>Details</th></tr>.*?(?=\s*</table>)',
            $tableBody,
            [System.Text.RegularExpressions.RegexOptions]::Singleline
        )
        $after = $after.Replace(
            'Size, build, grade, or finish target: ' + [string]$inputs[0],
            'Input to confirm: ' + [string]$inputs[0]
        )
        $after = $after.Replace('> Technical reference</div>', '> Specification review inputs</div>')
    }
    if ($after -cne $before) {
        [System.IO.File]::WriteAllText($file.FullName, $after, [System.Text.UTF8Encoding]::new($false))
        $changed++
    }
}

[ordered]@{
    status = 'PASS'
    productsNormalized = @($data.products).Count
    htmlFilesScanned = $htmlFiles.Count
    htmlFilesChanged = $changed
    productDirectoryFiles = $dataPaths.Count
    searchIndexFiles = $searchPaths.Count
    policy = 'Buyer-input fields replace unsupported supplier-specific specifications; exact values stay on evidence hold.'
} | ConvertTo-Json
