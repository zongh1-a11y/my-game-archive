# 我的游戏档案馆 — Starter

这是一个纯静态网站，不需要数据库、Node.js 或前端框架。

## 1. 先在电脑本地打开

解压后直接双击 `index.html` 即可。

如果浏览器对本地文件有限制，可以在该文件夹打开终端：

```bash
python -m http.server 8000
```

然后浏览器打开：

```text
http://localhost:8000
```

把你准备好的封面图片放到：

```text
assets/covers/
```

例如：

```text
assets/covers/pragmata.jpg
```

然后在两个文件中：

- `index.html`
- `games/pragmata.html`

把：

```html
pragmata-placeholder.svg
```

改成：

```html
pragmata.jpg
```

## 3. 添加自己的截图

把截图放到：

```text
assets/screenshots/pragmata/
```

例如：

```text
01.jpg
02.jpg
03.jpg
```

然后在 `games/pragmata.html` 的“截图墙”位置，把占位块替换成：

```html
<img src="../assets/screenshots/pragmata/01.jpg" alt="截图说明" />
```

## 4. 添加下一款游戏

最简单的方法：

1. 复制 `games/_template.html`
2. 重命名，比如 `fire-emblem-7.html`
3. 修改标题、平台、日期、评分、正文、图片
4. 在 `index.html` 的 `.game-grid` 中复制一张 `.game-card`
5. 把链接改到新页面

这就是整个网站的维护方式。

## 5. 发布到 GitHub Pages

### 方法 A：网页上传（最简单）

1. GitHub 新建一个 repository，例如 `my-game-archive`
2. 上传本文件夹中的所有内容
3. 打开 repository → `Settings`
4. 左侧进入 `Pages`
5. `Build and deployment` → `Source` 选择 `Deploy from a branch`
6. Branch 选择 `main`
7. Folder 选择 `/(root)`
8. 保存

发布后的地址一般类似：

```text
https://你的GitHub用户名.github.io/my-game-archive/
```

以后每次更新 repository，网页也会跟着更新。

## 6. 推荐的长期目录结构

```text
game_archive/
├── index.html
├── assets/
│   ├── style.css
│   ├── covers/
│   │   ├── pragmata.jpg
│   │   └── next-game.jpg
│   └── screenshots/
│       ├── pragmata/
│       │   ├── 01.jpg
│       │   └── 02.jpg
│       └── next-game/
└── games/
    ├── pragmata.html
    ├── next-game.html
    └── _template.html
```

## 7. 第一版先不要做的东西

暂时不要急着引入：

- React / Vue
- 数据库
- 登录系统
- 后台管理
- 自动抓取 IGDB
- 评论系统

等你真实记录到 10–20 款游戏以后，再判断哪些功能值得自动化。

## 建议备份

原图和截图最好同时保留一份本地原始备份。网站里的图片可以适当压缩，避免仓库过大。
https://zongh1-a11y.github.io/my-game-archive/
