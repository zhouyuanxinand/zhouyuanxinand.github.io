# 周园鑫的个人网站

纯 HTML / CSS / JS，零依赖零构建，托管在 GitHub Pages。

## 目录结构

```
├── index.html                  # 首页：介绍 + 经历 + 项目 + 精选随笔
├── posts.html                  # 随笔列表
├── posts/                      # 每篇随笔一个 HTML 文件
│   └── 2026-09-02-hello.html   # 示例文章（也是新文章模板）
└── assets/
    ├── style.css               # 全站样式（深浅色主题在 CSS 变量里）
    └── main.js                 # 主题切换 + 滚动入场动画
```

## 如何写一篇新随笔

1. 复制 `posts/2026-09-02-hello.html`，重命名为 `posts/新日期-标题.html`
   （例如 `posts/2026-10-01-guoqing.html`）
2. 打开新文件，替换 `<title>`、`<h1>`、日期和正文
3. 在 `posts.html` 和 `index.html` 的随笔列表里各加一行链接（最新的放最上面）
4. 提交并推送：

   ```bash
   git add .
   git commit -m "post: 新文章标题"
   git push
   ```

## 如何替换占位内容

搜索 `待替换` 三个字，所有需要你填真实信息的地方都有注释标注
（GitHub 链接、经历、项目等）。

## 本地预览

直接用浏览器打开 `index.html` 即可；或在本目录运行
`python -m http.server 8000` 后访问 http://localhost:8000
