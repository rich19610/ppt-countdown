# 发言倒计时 PowerPoint 插件

这是一个 PowerPoint Content Add-in，适合直接放在幻灯片上显示倒计时。它是纯 HTML/CSS/JavaScript，无后端依赖。

## 功能

- 设置分钟和秒钟。
- 开始、暂停、重置。
- 倒计时结束后在插件区域内显示“时间到”，没有弹窗。
- 使用时间戳计算剩余时间，切换窗口后也会自动校准。
- Windows 和 macOS 使用同一套 Office Web Add-in 文件。

## 文件

- `manifest.xml`：PowerPoint 插件清单。
- `src/index.html`：插件页面。
- `src/styles.css`：界面样式。
- `src/timer.js`：倒计时逻辑。
- `assets/`：插件图标。

## 本地试用

直接预览界面时，可以在浏览器打开：

```text
ppt-countdown-addin/preview.html
```

Office 插件需要通过 HTTPS 地址加载。`manifest.xml` 默认指向：

```text
https://localhost:3000/src/index.html
```

本地调试时，把 `ppt-countdown-addin` 目录作为静态站点用 HTTPS 服务起来，并让 PowerPoint 侧载 `manifest.xml`。正式使用时，把本目录放到任意 HTTPS 站点，然后把 `manifest.xml` 里的 `https://localhost:3000` 替换成正式域名。

## 使用方式

1. 在 PowerPoint 中侧载 `manifest.xml`。
2. 插入“发言倒计时”内容插件。
3. 在幻灯片上调整插件区域大小。
4. 输入分、秒，点击“开始”。
