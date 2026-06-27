# 获取脚本所在目录的父目录
$baseDir = Split-Path -Path $PSScriptRoot -Parent

$sourceRoot = Join-Path -Path $baseDir -ChildPath "src"
$targetRoot = Join-Path -Path $baseDir -ChildPath "UploadFile"

if (!(Test-Path -Path $targetRoot)) {
    New-Item -ItemType Directory -Force -Path $targetRoot
    Write-Host "Create target directory: $targetRoot" -ForegroundColor Cyan
}

$files = Get-ChildItem -Path $sourceRoot -Recurse -File

foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($baseDir.Length + 1)
    
    $newName = $relativePath.Replace("\", "_")

    # 在文件名前加上 app_ 前缀
    #$newName = "app_" + $newName
    
    $destinationPath = Join-Path -ChildPath $newName -Path $targetRoot
    
    Copy-Item -Path $file.FullName -Destination $destinationPath -Force
    
    Write-Host "Processed: $newName" -ForegroundColor Green
}

Write-Host "`nUpload successful to $targetRoot" -ForegroundColor Yellow
pause