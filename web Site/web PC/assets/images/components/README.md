# 图片资源目录

## 图片命名规范

按照项目规则，图片资源应遵循以下命名格式：
`功能-类型-状态.格式`

例如：
- `logo-main-white.png` - 主要logo的白色版本
- `logo-main-dark.png` - 主要logo的深色版本
- `hero-banner-1.jpg` - 第一张英雄区横幅图片

## 必需图片资源

在此目录中需要添加以下图片资源：

1. `logo-main-white.png` - 公司logo白色版本
   - 建议尺寸: 200x50 像素
   - 格式: PNG（透明背景）
   - 用途: 显示在深色导航栏背景上

2. `logo-main-dark.png` - 公司logo彩色/深色版本
   - 建议尺寸: 200x50 像素
   - 格式: PNG（透明背景）
   - 用途: 可用于浅色背景区域或页脚

## 如何添加logo

您可以：
1. 将您的公司logo图片文件重命名为对应名称并放在此目录中
2. 或者修改 `index.html` 中的图片路径，指向您实际的logo文件

## 设计建议

- 白色logo (`logo-main-white.png`) 应当是纯白色，以便在深蓝色导航栏上有良好的可视性
- 如果暂时没有logo，可以使用在线工具创建一个临时logo：
  - [Canva](https://www.canva.com/)
  - [LogoMakr](https://logomakr.com/)
  - [FreeLogoDesign](https://www.freelogodesign.org/)

## 配色方案

网站主要配色：
- 深蓝色: #1a365d (导航栏背景)
- 金色: #d4af37 (强调色和交互元素) 