param(
  [string]$WorkbookPath = "",
  [string]$OutputPath = ""
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot

if (-not $WorkbookPath) {
  $workbook = Get-ChildItem -LiteralPath $projectRoot -Filter "*.xlsx" | Select-Object -First 1
  if (-not $workbook) {
    throw "No XLSX workbook was found in $projectRoot"
  }
  $WorkbookPath = $workbook.FullName
}

if (-not $OutputPath) {
  $OutputPath = Join-Path $projectRoot "src\data\sheetCatalog.generated.json"
}

$excel = $null
$book = $null
$sheet = $null

try {
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false
  $book = $excel.Workbooks.Open($WorkbookPath, 0, $true)
  # The catalog-with-products worksheet is the third sheet in the source workbook.
  # Keeping this script ASCII-only makes it compatible with Windows PowerShell 5.
  $sheet = $book.Worksheets.Item(3)
  $usedRange = $sheet.UsedRange

  $currentGroup = ""
  $currentGroupEn = ""
  $currentSubgroup = ""
  $currentSubgroupEn = ""
  $records = [System.Collections.Generic.List[object]]::new()

  for ($row = 2; $row -le $usedRange.Rows.Count; $row++) {
    $group = ([string]$sheet.Cells.Item($row, 2).Value2).Trim()
    $groupEn = ([string]$sheet.Cells.Item($row, 3).Value2).Trim()
    $subgroup = ([string]$sheet.Cells.Item($row, 4).Value2).Trim()
    $subgroupEn = ([string]$sheet.Cells.Item($row, 5).Value2).Trim()

    if ($group) { $currentGroup = $group }
    if ($groupEn) { $currentGroupEn = $groupEn }
    if ($subgroup) { $currentSubgroup = $subgroup }
    if ($subgroupEn) { $currentSubgroupEn = $subgroupEn }

    $category = ([string]$sheet.Cells.Item($row, 6).Value2).Trim()
    $categoryEn = ([string]$sheet.Cells.Item($row, 7).Value2).Trim()
    $brand = ([string]$sheet.Cells.Item($row, 8).Value2).Trim()
    $model = ([string]$sheet.Cells.Item($row, 9).Value2).Trim()
    $country = ([string]$sheet.Cells.Item($row, 10).Value2).Trim()
    $source = ([string]$sheet.Cells.Item($row, 11).Value2).Trim()

    if (-not $currentGroup -or -not $currentSubgroup -or -not $category -or -not $brand -or -not $model) {
      continue
    }

    $records.Add([ordered]@{
      id = "sheet-$row"
      group = $currentGroup
      groupEn = $currentGroupEn
      subgroup = $currentSubgroup
      subgroupEn = $currentSubgroupEn
      category = $category
      categoryEn = $categoryEn
      brand = $brand
      model = $model
      country = $country
      source = $source
    })
  }

  $json = $records | ConvertTo-Json -Depth 4 -Compress
  $utf8WithoutBom = [System.Text.UTF8Encoding]::new($false)
  [System.IO.File]::WriteAllText($OutputPath, $json, $utf8WithoutBom)
  Write-Output "Exported $($records.Count) catalog records to $OutputPath"
}
finally {
  if ($book) { $book.Close($false) }
  if ($excel) { $excel.Quit() }
  if ($sheet) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($sheet) }
  if ($book) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($book) }
  if ($excel) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($excel) }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
