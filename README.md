# 游玩清单自助管理功能补丁

这是“非破坏式”补丁包：不会覆盖你现有的 index.html、queue.html、style.css 或你自己改过的游戏描述。

## 使用方法

1. 把本压缩包解压到你本地的 `my-game-archive` 仓库根目录。
2. 解压后会新增：

```text
assets/queue-manager.js
```

3. 打开你当前最新的 `queue.html`，只在 `</body>` 前增加这一行：

```html
<script src="assets/queue-manager.js"></script>
```

4. 保存后用 GitHub Desktop：
   - Commit to main
   - Push origin

## 新增功能

- “＋ 添加游戏”按钮
- 弹窗填写游戏名称
- 平台：PC / NS1 / NS2 / GBA / 3DS / 其他
- 状态：正在玩 / 准备玩
- 自定义备注
- 自动平台彩色徽标
- 已有卡片增加“编辑 / 删除”
- 可以把游戏从“准备要玩”直接改成“正在玩”
- 使用浏览器 localStorage 保存

## 平台颜色

- PC：蓝色
- NS1：深红
- NS2：亮红
- GBA：绿色
- 3DS：紫色
- 其他：灰色

## 注意

localStorage 只保存在当前浏览器。换设备、换浏览器或清除站点数据后，不会自动同步。

https://zongh1-a11y.github.io/my-game-archive/
