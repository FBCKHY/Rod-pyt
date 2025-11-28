# 快速创建产品分类脚本
# 使用方法: 在PowerShell中运行此脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  产品分类快速初始化脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查后端服务是否运行
Write-Host "检查后端服务..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ 后端服务正常运行" -ForegroundColor Green
} catch {
    Write-Host "❌ 后端服务未运行,请先启动后端服务!" -ForegroundColor Red
    Write-Host "   启动命令: cd backend && npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "开始创建产品分类..." -ForegroundColor Yellow
Write-Host ""

# 定义分类数据
$categories = @(
    @{
        name = "燃气灶系列"
        description = "高效节能的燃气灶产品,采用先进燃烧技术"
        icon = "gas-stove.png"
        status = "active"
        sortOrder = 1
    },
    @{
        name = "抽油烟机系列"
        description = "强力吸排的抽油烟机产品,保持厨房清新"
        icon = "range-hood.png"
        status = "active"
        sortOrder = 2
    },
    @{
        name = "集成灶系列"
        description = "多功能集成灶产品,集烹饪、吸排于一体"
        icon = "integrated-stove.png"
        status = "active"
        sortOrder = 3
    },
    @{
        name = "消毒柜系列"
        description = "健康安全的消毒柜产品,守护家人健康"
        icon = "disinfection-cabinet.png"
        status = "active"
        sortOrder = 4
    },
    @{
        name = "热水器系列"
        description = "恒温舒适的热水器产品,享受舒适沐浴"
        icon = "water-heater.png"
        status = "active"
        sortOrder = 5
    }
)

$successCount = 0
$failCount = 0

# 创建每个分类
foreach ($category in $categories) {
    try {
        $body = $category | ConvertTo-Json -Depth 10
        
        $response = Invoke-RestMethod `
            -Uri "http://localhost:3001/api/product-categories" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -ErrorAction Stop
        
        if ($response.code -eq 200) {
            Write-Host "✅ 创建成功: $($category.name) (ID: $($response.data.id))" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "❌ 创建失败: $($category.name) - $($response.message)" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "❌ 创建失败: $($category.name) - $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
    
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  创建完成!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "成功: $successCount 个" -ForegroundColor Green
Write-Host "失败: $failCount 个" -ForegroundColor Red
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "✅ 现在可以在产品创建页面选择分类了!" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步操作:" -ForegroundColor Yellow
    Write-Host "1. 刷新产品创建页面" -ForegroundColor White
    Write-Host "2. 进入第三步" -ForegroundColor White
    Write-Host "3. 点击分类选择器,应该能看到刚创建的分类" -ForegroundColor White
    Write-Host "4. 选择一个分类,完成产品创建" -ForegroundColor White
} else {
    Write-Host "❌ 所有分类创建失败,请检查:" -ForegroundColor Red
    Write-Host "1. 后端服务是否正常运行" -ForegroundColor White
    Write-Host "2. 数据库连接是否正常" -ForegroundColor White
    Write-Host "3. 查看后端日志获取详细错误信息" -ForegroundColor White
}

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
