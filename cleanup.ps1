# 项目清理脚本
# 删除临时测试文件和重复文档

Write-Host "🗑️ 开始清理项目..." -ForegroundColor Cyan
Write-Host ""

$deletedCount = 0
$errorCount = 0

# 切换到项目目录
$projectDir = "c:\Users\13350\Desktop\oai 08"
Set-Location $projectDir

# 1. 删除测试脚本
Write-Host "📦 清理测试脚本..." -ForegroundColor Yellow
$testScripts = @(
    "backend\test-db-connection.js",
    "backend\test-query.js",
    "backend\test-service.js"
)

foreach ($file in $testScripts) {
    if (Test-Path $file) {
        try {
            Remove-Item $file -Force
            Write-Host "  ✅ 已删除: $file" -ForegroundColor Green
            $deletedCount++
        } catch {
            Write-Host "  ❌ 删除失败: $file" -ForegroundColor Red
            $errorCount++
        }
    }
}

# 2. 删除临时修复文档
Write-Host "`n📄 清理临时修复文档..." -ForegroundColor Yellow
$docsToDelete = @(
    "产品列表显示修复.md",
    "产品创建ID提取修复.md",
    "产品创建功能优化完成.md",
    "产品创建功能完整性测试报告.md",
    "产品型号自动生成修复.md",
    "分类创建完成-立即测试.md",
    "分类加载问题修复.md",
    "分类问题最终修复.md",
    "初始化产品分类.md",
    "图片上传最终修复-成功.md",
    "图片上传问题修复.md",
    "图片上传问题最终修复.md",
    "测试产品模板系统.md",
    "数据提取路径全面修复报告.md",
    "预览详情功能修复.md",
    "URL重复问题修复.md",
    "静态文件路径修复-需要重启后端.md"
)

foreach ($doc in $docsToDelete) {
    if (Test-Path $doc) {
        try {
            Remove-Item $doc -Force
            Write-Host "  ✅ 已删除: $doc" -ForegroundColor Green
            $deletedCount++
        } catch {
            Write-Host "  ❌ 删除失败: $doc" -ForegroundColor Red
            $errorCount++
        }
    }
}

# 3. 删除测试HTML
Write-Host "`n🌐 清理测试HTML..." -ForegroundColor Yellow
if (Test-Path "报告\test-runner.html") {
    try {
        Remove-Item "报告\test-runner.html" -Force
        Write-Host "  ✅ 已删除: 报告\test-runner.html" -ForegroundColor Green
        $deletedCount++
    } catch {
        Write-Host "  ❌ 删除失败: 报告\test-runner.html" -ForegroundColor Red
        $errorCount++
    }
}

# 4. 删除临时脚本
Write-Host "`n📜 清理临时脚本..." -ForegroundColor Yellow
if (Test-Path "快速创建基础分类.ps1") {
    try {
        Remove-Item "快速创建基础分类.ps1" -Force
        Write-Host "  ✅ 已删除: 快速创建基础分类.ps1" -ForegroundColor Green
        $deletedCount++
    } catch {
        Write-Host "  ❌ 删除失败: 快速创建基础分类.ps1" -ForegroundColor Red
        $errorCount++
    }
}

# 5. 删除空目录
Write-Host "`n📁 清理空目录..." -ForegroundColor Yellow
if (Test-Path "产品详情目录") {
    try {
        Remove-Item "产品详情目录" -Force -Recurse
        Write-Host "  ✅ 已删除: 产品详情目录/" -ForegroundColor Green
        $deletedCount++
    } catch {
        Write-Host "  ❌ 删除失败: 产品详情目录/" -ForegroundColor Red
        $errorCount++
    }
}

# 总结
Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "✅ 清理完成!" -ForegroundColor Green
Write-Host "📊 统计信息:" -ForegroundColor Cyan
Write-Host "  - 成功删除: $deletedCount 个文件/目录" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "  - 删除失败: $errorCount 个文件/目录" -ForegroundColor Red
}
Write-Host "="*50 -ForegroundColor Cyan

# 询问是否查看Git状态
Write-Host "`n是否查看Git状态? (Y/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host "`n📊 Git状态:" -ForegroundColor Cyan
    git status --short
}

Write-Host "`n💡 提示: 运行 'git add .' 和 'git commit' 来提交这些更改" -ForegroundColor Cyan
