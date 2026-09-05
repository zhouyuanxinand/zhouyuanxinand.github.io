# -*- coding: utf-8 -*-
"""
Awesome AI Roadmap 转载构建脚本
内容来源: https://github.com/zongyangbigpolo/awesome-ai-roadmap (CC BY 4.0, 原作者 Polo Li)
把 docs/ 下的 Markdown 文档树原样转换为本站 roadmap/ 下的静态页面。
"""
import os, re, json, sys
import yaml
import markdown

SRC = os.path.expanduser("~/awesome-ai-roadmap")
DOCS = os.path.join(SRC, "docs")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "roadmap")
OUT = os.path.abspath(OUT)

# mkdocs.yml 含 python/name 等自定义标签，用 BaseLoader 宽松解析
with open(os.path.join(SRC, "mkdocs.yml"), encoding="utf-8") as f:
    cfg = yaml.load(f, Loader=yaml.BaseLoader)

# ---------- 解析 nav 为有序树 ----------
# 节点: (title, path_or_none, children)
def parse_nav(items):
    out = []
    for it in items:
        if isinstance(it, str):
            out.append((None, it, []))
        elif isinstance(it, dict):
            for title, val in it.items():
                if isinstance(val, str):
                    out.append((title, val, []))
                elif isinstance(val, list):
                    out.append((title, None, parse_nav(val)))
    return out

nav = parse_nav(cfg["nav"])
# 去掉「关于」模块；「首页」README 作为导览页
nav = [n for n in nav if n[0] not in ("关于",)]

# ---------- 收集页面 (path -> title, tree path) ----------
pages = {}   # relpath.md -> {"title":..., "crumb":[...]}
def walk(nodes, trail):
    for title, path, children in nodes:
        if path:
            t = title or title_from_file(path)
            pages[path] = {"title": t, "crumb": trail[:]}
        if children:
            walk(children, trail + [title])
def title_from_file(path):
    p = os.path.join(DOCS, path)
    if os.path.exists(p):
        with open(p, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("# "):
                    return line[2:].strip()
    return os.path.basename(path)
walk(nav, [])

# nav 里没列到的 md 文件也收进来（挂在所属目录下）
for root, _, files in os.walk(DOCS):
    for fn in files:
        if fn.endswith(".md"):
            rel = os.path.relpath(os.path.join(root, fn), DOCS).replace("\\", "/")
            if rel in ("about.md", "editorial-policy.md"):
                continue
            if rel not in pages:
                pages[rel] = {"title": title_from_file(rel), "crumb": []}

def out_path(rel):
    """README.md -> 目录 index.html；其他 -> 同名 .html"""
    p = rel[:-3]  # 去 .md
    if p.endswith("/README") or p == "README":
        p = p[:-7] if p != "README" else ""
        return p + "index.html" if p else "index.html"
    return p + ".html"

def depth_of(rel_html):
    return rel_html.count("/")

# ---------- Markdown 转换 ----------
MD_EXTS = ["tables", "fenced_code", "toc", "attr_list", "sane_lists", "nl2br" if False else "def_list"]

def convert_md(text, rel):
    # 去除 YAML frontmatter
    text = re.sub(r"^---\s*\n.*?\n---\s*\n", "", text, flags=re.S)
    # mermaid 代码块 -> <pre class="mermaid">
    text = re.sub(r"```mermaid\s*\n(.*?)```",
                  lambda m: '<pre class="mermaid">' + m.group(1) + "</pre>",
                  text, flags=re.S)
    has_mermaid = 'class="mermaid"' in text
    # 相对链接 .md -> .html
    def fix_link(m):
        url = m.group(2)
        if re.match(r"^(https?:|#|mailto:)", url):
            return m.group(0)
        if url.endswith(".md") or ".md#" in url:
            if ".md#" in url:
                base, anchor = url.split("#", 1)
                anchor = "#" + anchor
            else:
                base, anchor = url, ""
            base = base[:-3]
            if base.endswith("/README") or base == "README":
                base = base[:-6] if base != "README" else "./"
                url = base.rstrip("/") + "/" if not base.endswith("/") else base
                return m.group(1) + url + anchor + m.group(3)
            return m.group(1) + base + ".html" + anchor + m.group(3)
        return m.group(0)
    text = re.sub(r"(\]\()(.*?)(\))", fix_link, text)
    html_body = markdown.markdown(text, extensions=MD_EXTS)
    return html_body, has_mermaid

# ---------- 模板 ----------
def prefix(rel_html):
    d = depth_of(rel_html)
    return "../" * d

MERMAID_SNIPPET = """<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<script>mermaid.initialize({startOnLoad:true, theme:'default'});</script>"""

def sidebar_html(rel_html):
    """当前页面所属的顶层模块树（其余模块只列入口）"""
    top = rel_html.split("/")[0] if "/" in rel_html else ""
    def render_nodes(nodes, trail_paths):
        s = []
        for title, path, children in nodes:
            if path:
                oh = out_path(path)
                active = ' class="active"' if oh == rel_html else ""
                href = prefix(rel_html) + oh
                s.append(f'<li><a{active} href="{href}">{title or title_from_file(path)}</a></li>')
            if children:
                s.append(f'<li class="group"><span>{title}</span><ul>' + "".join(render_nodes(children, trail_paths)) + '</ul></li>')
        return s
    items = []
    for title, path, children in nav:
        if title in ("首页",):
            items.append(f'<li><a href="{prefix(rel_html)}index.html">导览首页</a></li>')
            continue
        if title in top or top in (path or ""):
            inner = "".join(render_nodes(children, []))
            items.append(f'<li class="group open"><span>{title}</span><ul>{inner}</ul></li>')
        else:
            items.append(f'<li class="group closed"><span>{title}</span><ul style="display:none"></ul></li>')
    return '<ul class="rm-tree">' + "".join(items) + "</ul>"

TEMPLATE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} · Awesome AI Roadmap · 周园鑫</title>
  <meta name="description" content="{title} — Awesome AI Roadmap（转载，原作者 Polo Li，CC BY 4.0）">
  <link rel="icon" type="image/svg+xml" href="{pre}assets/favicon.svg">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{pre}assets/style.css">
  <link rel="stylesheet" href="{pre}roadmap/roadmap.css">
  <script src="{pre}assets/main.js"></script>
</head>
<body class="roadmap-page">
  <nav class="site-nav">
    <div class="wrap rm-nav">
      <a class="brand" href="{pre}home.html">ZHOU<b>·</b>YUANXIN</a>
      <div class="nav-links">
        <a href="{pre}home.html">首页</a>
        <a href="{pre}posts.html">随笔</a>
        <a href="{pre}roadmap/index.html" class="active">Roadmap</a>
        <a href="https://github.com/zhouyuanxinand" target="_blank" rel="noopener">GitHub</a>
        <button class="theme-toggle" type="button">☾ DARK</button>
      </div>
    </div>
  </nav>
  <div class="rm-shell">
    <aside class="rm-side">
      <div class="rm-side-head">Awesome AI Roadmap</div>
      {sidebar}
      <div class="rm-attr-side">内容转载自 <a href="https://zongyangbigpolo.github.io/awesome-ai-roadmap/" target="_blank" rel="noopener">原站</a> · 作者 Polo Li · CC BY 4.0</div>
    </aside>
    <main class="rm-main">
      <div class="rm-crumb">{crumb}</div>
      <div class="rm-attr">本文转载自 <a href="https://zongyangbigpolo.github.io/awesome-ai-roadmap/" target="_blank" rel="noopener">Awesome AI Roadmap</a>，原作者 <a href="https://github.com/zongyangbigpolo" target="_blank" rel="noopener">Polo Li</a>，依 CC BY 4.0 协议共享。</div>
      <article class="post-body rm-body">
        {body}
      </article>
    </main>
  </div>
  {mermaid}
</body>
</html>"""

# ---------- 生成 ----------
os.makedirs(OUT, exist_ok=True)
count = 0
for rel, info in sorted(pages.items()):
    src = os.path.join(DOCS, rel)
    if not os.path.exists(src):
        print("missing:", rel); continue
    with open(src, encoding="utf-8") as f:
        text = f.read()
    body, has_mermaid = convert_md(text, rel)
    oh = out_path(rel)
    dest = os.path.join(OUT, oh)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    crumb_parts = info["crumb"] + [info["title"]]
    crumb = " / ".join(f"<span>{c}</span>" for c in crumb_parts if c)
    html = (TEMPLATE
            .replace("{title}", info["title"])
            .replace("{pre}", prefix(oh))
            .replace("{sidebar}", sidebar_html(oh))
            .replace("{crumb}", crumb)
            .replace("{body}", body)
            .replace("{mermaid}", MERMAID_SNIPPET if has_mermaid else ""))
    with open(dest, "w", encoding="utf-8") as f:
        f.write(html)
    count += 1

# ---------- 导览首页（基于 docs/README.md，若缺失则用 nav 生成） ----------
readme = os.path.join(DOCS, "README.md")
if os.path.exists(readme):
    with open(readme, encoding="utf-8") as f:
        rtext = f.read()
    rbody, has_m = convert_md(rtext, "README.md")
else:
    rbody, has_m = "", False

# 模块卡片区
cards = []
for title, path, children in nav:
    if title == "首页":
        continue
    href = None
    # 找该模块的导览页（第一个带 path 的节点）
    def first_path(nodes):
        for t, p, ch in nodes:
            if p: return p
            if ch:
                r = first_path(ch)
                if r: return r
        return None
    fp = first_path([(title, path, children)])
    if fp:
        cards.append(f'<a class="rm-card" href="{out_path(fp)}"><b>{title}</b><span>{len(children)} 个小节</span></a>')
index_body = f"""<h1>Awesome AI Roadmap</h1>
<p class="rm-lead">覆盖 LLM、多模态、Tools、Agent、RAG、AI 框架、LLMOps、安全治理与 FDE 的中文 AI 工程知识图谱。</p>
<div class="rm-cards">{''.join(cards)}</div>
<hr>
{rbody}"""
html = (TEMPLATE
        .replace("{title}", "导览")
        .replace("{pre}", "../")
        .replace("{sidebar}", sidebar_html("index.html"))
        .replace("{crumb}", "<span>导览</span>")
        .replace("{body}", index_body)
        .replace("{mermaid}", MERMAID_SNIPPET if has_m else ""))
with open(os.path.join(OUT, "index.html"), "w", encoding="utf-8") as f:
    f.write(html)

print(f"generated {count} doc pages + index")
print("OUT:", OUT)
