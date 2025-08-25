# GitHub Actions 自动构建指南

## 概述

本项目使用 GitHub Actions 自动构建和打包 Electron 应用，支持 Windows、macOS 和 Linux 平台。

## 工作流文件

### 1. `build-electron.yml` - 完整构建工作流
- **触发条件**: 
  - 推送标签 (v*)
  - Pull Request
  - 手动触发
- **功能**: 
  - 多平台构建 (Ubuntu, Windows, macOS)
  - 多Node.js版本测试
  - 自动发布到GitHub Releases

### 2. `quick-build.yml` - 快速构建测试
- **触发条件**: 
  - Pull Request
  - 手动触发
- **功能**: 
  - 仅Linux平台构建
  - 快速验证构建是否成功

## 使用方法

### 自动构建（推荐）

1. **推送代码到GitHub**
   ```bash
   git add .
   git commit -m "feat: 新功能"
   git push origin main
   ```

2. **创建标签触发发布**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **查看构建状态**
   - 访问 GitHub 仓库的 Actions 标签页
   - 查看构建进度和结果

### 手动触发

1. 访问 GitHub 仓库
2. 点击 Actions 标签页
3. 选择对应的工作流
4. 点击 "Run workflow" 按钮

## 构建产物

### Windows
- `HanlianAdmin-1.0.0.exe` - 便携版
- `HanlianAdmin Setup 1.0.0.exe` - 安装版

### macOS
- `HanlianAdmin-1.0.0.dmg` - 磁盘镜像

### Linux
- `HanlianAdmin-1.0.0.AppImage` - AppImage格式

## 环境变量

工作流中配置了以下环境变量：
- `ELECTRON_MIRROR`: 使用中国镜像源加速下载
- `ELECTRON_CACHE`: Electron缓存目录
- `ELECTRON_BUILDER_CACHE`: Electron Builder缓存目录

## 注意事项

1. **Node.js版本**: 支持 Node.js 18 和 20
2. **Python版本**: 需要 Python 3.11
3. **缓存**: 使用GitHub Actions缓存加速构建
4. **发布**: 只有推送标签时才会自动发布到Releases

## 故障排除

### 构建失败
1. 检查代码是否有语法错误
2. 确认依赖包版本兼容性
3. 查看构建日志获取详细错误信息

### 下载超时
1. 检查网络连接
2. 确认镜像源是否可用
3. 重试构建

### 平台特定问题
1. **Windows**: 确保使用x64架构
2. **macOS**: 支持Intel和Apple Silicon
3. **Linux**: 使用AppImage格式确保兼容性

## 自定义配置

如需修改构建配置，可以编辑：
- `.github/workflows/*.yml` - 工作流配置
- `electron-builder.json` - 打包配置
- `package.json` - 项目配置

## 联系支持

如有问题，请：
1. 查看GitHub Issues
2. 检查Actions日志
3. 提交新的Issue描述问题
