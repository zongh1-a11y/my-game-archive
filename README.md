# 游玩清单自助管理补丁（含 JSON 导入/导出）

这是增量补丁，不会覆盖你当前网页中的文字描述、queue.html 内容或 style.css。

## 安装

将本压缩包解压到 `my-game-archive` 仓库根目录，使文件位于：

```text
assets/queue-manager.js
```

如果你的 `queue.html` 还没有引入脚本，请在 `</body>` 前加入：

```html
<script src="assets/queue-manager.js"></script>
```

如果已经有这一行，不需要重复添加。

## 功能

- 添加游戏
- 编辑游戏
- 删除游戏
- 平台选择：PC / NS1 / NS2 / GBA / 3DS / 其他
- 状态选择：正在玩 / 准备玩
- 自定义备注
- localStorage 本地保存
- 导出 JSON
- 导入 JSON

## 导出 JSON

点击“导出 JSON”后，会下载类似：

```text
my-game-archive-queue-2026-09-29.json
```

这个文件保存你当前浏览器里的清单修改，可作为备份，也可以带到另一台电脑。

## 导入 JSON

点击“导入 JSON”，选择之前导出的文件。

导入会覆盖当前浏览器中的游玩清单修改，因此程序会先弹窗确认。建议导入前先导出一份备份。

## 适合你的工作流

1. 本地网页里添加、编辑游戏
2. 导出 JSON 作为备份
3. 如换电脑或浏览器，导入 JSON 恢复
4. HTML / CSS / JS 的修改继续通过 GitHub Desktop 一次 Commit + Push
5. 当前这版 JSON 是“浏览器数据备份”，不会自动改 GitHub 仓库文件

https://zongh1-a11y.github.io/my-game-archive/
