// 主题切换：localStorage 记住选择，默认跟随系统
(function () {
  var root = document.documentElement;
  var saved = localStorage.getItem("theme");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));

  function updateBtn() {
    var btn = document.querySelector(".theme-toggle");
    if (btn) btn.textContent = root.getAttribute("data-theme") === "dark" ? "☀ LIGHT" : "☾ DARK";
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateBtn();
    var btn = document.querySelector(".theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        updateBtn();
      });
    }

    // Hero：打字机逐字打出问候语，完成后光标闪耀
    var heroH1 = document.querySelector(".hero-type, .hero-mono");
    if (heroH1) {
      var full = heroH1.getAttribute("data-text") || heroH1.textContent;
      var cursor = heroH1.querySelector(".cursor");
      var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced || !cursor) {
        // 减弱动效：直接显示全文
      } else {
        heroH1.textContent = "";
        heroH1.appendChild(cursor);
        var i = 0;
        (function type() {
          if (i < full.length) {
            var ch = full[i++];
            if (ch === "\n") {
              cursor.before(document.createElement("br"));
            } else {
              cursor.before(document.createTextNode(ch));
            }
            setTimeout(type, /[，。,.、]/.test(ch) ? 280 : 110);
          } else {
            cursor.classList.add("shine");
          }
        })();
      }
    }

    // 项目卡片：stars 超过 1k 点燃「很火」动效（读 shields.io SVG 文本，避开 GitHub API 限流）
    document.querySelectorAll("[data-stars-repo]").forEach(function (el) {
      fetch("https://img.shields.io/github/stars/" + el.getAttribute("data-stars-repo") + "?style=flat-square")
        .then(function (r) { return r.text(); })
        .then(function (svg) {
          var m = svg.match(/>([0-9.]+)(k?)</);
          if (!m) return;
          var n = parseFloat(m[1]) * (m[2] ? 1000 : 1);
          if (n > 1000) el.classList.add("hot");
        })
        .catch(function () { /* 失败时静默跳过 */ });
    });

    // Email 按钮：点击复制邮箱地址，短暂显示「已复制」
    var copyBtn = document.getElementById("copy-email");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var email = "3089729486@qq.com";
        function done() {
          copyBtn.textContent = "已复制 ✓";
          copyBtn.classList.add("copied");
          // 底部弹出明显提示条
          var toast = document.querySelector(".copy-toast");
          if (!toast) {
            toast = document.createElement("div");
            toast.className = "copy-toast";
            document.body.appendChild(toast);
          }
          toast.innerHTML = "已复制到剪贴板：<b>" + email + "</b>";
          toast.classList.add("show");
          setTimeout(function () {
            copyBtn.textContent = "Email";
            copyBtn.classList.remove("copied");
            toast.classList.remove("show");
          }, 2000);
        }
        function fallback() {
          var ta = document.createElement("textarea");
          ta.value = email;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); } catch (e) {}
          document.body.removeChild(ta);
          done();
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(done).catch(fallback);
        } else {
          fallback();
        }
      });
    }

    // 实习经历：点击展开/收起工作内容
    document.querySelectorAll(".exp-head").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".exp");
        var open = item.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    // 文章页：估算阅读时长（中文按 400 字/分钟），追加到 .post-meta
    var body = document.querySelector(".post-body");
    var meta = document.querySelector(".post-meta");
    if (body && meta) {
      var chars = body.textContent.replace(/\s/g, "").length;
      var mins = Math.max(1, Math.round(chars / 400));
      meta.textContent += " · 约 " + mins + " 分钟";
    }

    // 返回顶部按钮：滚动超过一屏后出现
    var topBtn = document.createElement("button");
    topBtn.className = "back-to-top";
    topBtn.type = "button";
    topBtn.title = "返回顶部";
    topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.body.appendChild(topBtn);
    window.addEventListener("scroll", function () {
      topBtn.classList.toggle("show", window.scrollY > 400);
    }, { passive: true });

    // ============ 推特风交互特效（仅主页元素存在时生效） ============
    var finePointer = window.matchMedia("(pointer: fine)").matches;
    var noReduce = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

    if (noReduce && finePointer) {
      // 1. 磁性按钮：Hero 胶囊被鼠标轻微吸引，离开弹回
      document.querySelectorAll(".hero .chip").forEach(function (el) {
        el.style.transition = "transform .25s cubic-bezier(.22,1,.36,1)";
        el.addEventListener("pointermove", function (e) {
          var r = el.getBoundingClientRect();
          var dx = e.clientX - (r.left + r.width / 2);
          var dy = e.clientY - (r.top + r.height / 2);
          el.style.transform = "translate(" + dx * 0.18 + "px," + dy * 0.28 + "px)";
        });
        el.addEventListener("pointerleave", function () {
          el.style.transform = "";
        });
      });

      // 2. 聚光灯卡片：项目卡内跟随鼠标的橙色光晕
      document.querySelectorAll(".card").forEach(function (card) {
        card.addEventListener("pointermove", function (e) {
          var r = card.getBoundingClientRect();
          card.style.setProperty("--mx", (e.clientX - r.left) + "px");
          card.style.setProperty("--my", (e.clientY - r.top) + "px");
        });
      });
    }

    if (noReduce) {
      // 3. 数字解码：分区大编号进入视口时从乱码收敛成型
      var nums = document.querySelectorAll(".sec-num");
      if (nums.length) {
        var decode = function (el) {
          var target = el.getAttribute("data-final");
          var digits = "0123456789";
          var frame = 0, total = 18;
          var timer = setInterval(function () {
            frame++;
            el.textContent = target.split("").map(function (c, i) {
              return frame / total > (i + 1) / target.length ? c
                : digits[Math.floor(Math.random() * 10)];
            }).join("");
            if (frame >= total) { el.textContent = target; clearInterval(timer); }
          }, 40);
        };
        nums.forEach(function (el) {
          el.setAttribute("data-final", el.textContent);
          el.textContent = "00".slice(0, el.textContent.length);
        });
        var nio = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { decode(e.target); nio.unobserve(e.target); }
          });
        }, { threshold: 0.5 });
        nums.forEach(function (el) { nio.observe(el); });
      }

      // 4. 经历时间线：条目交错滑入（旅程叙事）
      var exps = document.querySelectorAll(".exp");
      if (exps.length) {
        exps.forEach(function (el, i) {
          el.classList.add("exp-enter");
          el.style.transitionDelay = (i % 6) * 70 + "ms";
        });
        var eio = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add("exp-in"); eio.unobserve(e.target); }
          });
        }, { threshold: 0.15 });
        exps.forEach(function (el) { eio.observe(el); });
      }
    }

    // ============ 推特博主风创意特效 ============

    // 5. 鼠标墨点轨迹：移动时留下渐隐的橙色墨点（纸面手绘感）
    if (noReduce && finePointer) {
      var lastDot = 0;
      document.addEventListener("pointermove", function (e) {
        var now = Date.now();
        if (now - lastDot < 45) return;
        lastDot = now;
        var d = document.createElement("span");
        d.className = "ink-dot";
        var s = 3 + Math.random() * 5;
        d.style.left = e.clientX + "px";
        d.style.top = e.clientY + "px";
        d.style.width = s + "px";
        d.style.height = s + "px";
        document.body.appendChild(d);
        d.addEventListener("animationend", function () { d.remove(); });
      });
    }

    // 6a. 头像粒子喷绘：2D 图转成粒子，鼠标穿过散开、离开后合拢
    var canvasActive = false;
    var pCanvas = document.getElementById("portrait-canvas");
    var pImg = document.getElementById("portrait-img");
    var pWrap = document.getElementById("hero-portrait");
    if (pCanvas && pImg && pWrap && noReduce && finePointer) {
      var pctx = pCanvas.getContext("2d");
      var particles = [];
      var pmouse = { x: -9999, y: -9999 };
      var dpr = Math.min(window.devicePixelRatio || 1, 2);

      var initParticles = function () {
        var dispW = pImg.clientWidth || 460;
        var dispH = dispW; // 方形
        pCanvas.width = dispW * dpr;
        pCanvas.height = dispH * dpr;
        pctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // 离屏采样：把图按显示尺寸画到离屏 canvas 读像素
        var off = document.createElement("canvas");
        var step = 4; // 采样步长，控制粒子密度
        off.width = Math.round(dispW / step);
        off.height = Math.round(dispH / step);
        var octx = off.getContext("2d");
        octx.drawImage(pImg, 0, 0, off.width, off.height);
        var data = octx.getImageData(0, 0, off.width, off.height).data;
        particles = [];
        for (var y = 0; y < off.height; y++) {
          for (var x = 0; x < off.width; x++) {
            var i = (y * off.width + x) * 4;
            var a = data[i + 3];
            if (a < 140) continue; // 跳过透明背景
            var r = data[i], g = data[i + 1], b = data[i + 2];
            // 跳过接近纸色的像素（喷绘留白）
            if (r > 235 && g > 230 && b > 220) continue;
            particles.push({
              ox: x * step, oy: y * step,
              x: x * step, y: y * step,
              vx: 0, vy: 0,
              c: "rgb(" + r + "," + g + "," + b + ")",
              s: step
            });
          }
        }
        pWrap.classList.add("canvas-on");
      };

      var tick = function () {
        pctx.clearRect(0, 0, pCanvas.width / dpr, pCanvas.height / dpr);
        var R = 60, R2 = R * R;
        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];
          // 鼠标排斥
          var dx = p.x - pmouse.x, dy = p.y - pmouse.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) {
            var d = Math.sqrt(d2);
            var f = (R - d) / R * 2.2;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
          // 弹簧回位 + 阻尼
          p.vx += (p.ox - p.x) * 0.06;
          p.vy += (p.oy - p.y) * 0.06;
          p.vx *= 0.86;
          p.vy *= 0.86;
          p.x += p.vx;
          p.y += p.vy;
          pctx.fillStyle = p.c;
          pctx.fillRect(p.x, p.y, p.s, p.s);
        }
        requestAnimationFrame(tick);
      };

      var src = new Image();
      src.onload = function () {
        pImg.src = src.src; // 保证尺寸可用
        initParticles();
        tick();
      };
      src.src = pImg.getAttribute("src");

      pWrap.addEventListener("pointermove", function (e) {
        var r = pCanvas.getBoundingClientRect();
        pmouse.x = e.clientX - r.left;
        pmouse.y = e.clientY - r.top;
      });
      pWrap.addEventListener("pointerleave", function () {
        pmouse.x = -9999; pmouse.y = -9999;
      });
      canvasActive = true;
    }

    // 6. 头像 3D 视差：鼠标在 Hero 区移动时头像轻微跟随（粒子模式关闭时）
    var portraitImg = document.querySelector(".hero-portrait img");
    var heroEl = document.querySelector(".hero");
    if (portraitImg && heroEl && noReduce && finePointer && !canvasActive) {
      portraitImg.style.transition = "transform .25s cubic-bezier(.22,1,.36,1)";
      heroEl.addEventListener("pointermove", function (e) {
        var r = heroEl.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        portraitImg.style.transform =
          "rotate(2.5deg) perspective(900px) rotateY(" + (x * 8) + "deg) rotateX(" + (-y * 8) + "deg)";
      });
      heroEl.addEventListener("pointerleave", function () {
        portraitImg.style.transform = "rotate(2.5deg)";
      });
    }

    // 7. ⌘K 命令面板
    var CMDS = [
      { label: "进入主页", hint: "首页顶部", act: function () { window.scrollTo({ top: 0, behavior: "smooth" }); } },
      { label: "全部随笔", hint: "Writing", act: function () { location.href = "posts.html"; } },
      { label: "Codex Field Guide", hint: "14 章技术教材", act: function () { location.href = "/codex-field-guide/"; } },
      { label: "Awesome AI Roadmap", hint: "200 篇知识图谱", act: function () { location.href = "roadmap/index.html"; } },
      { label: "下载简历 PDF", hint: "后端开发_周园鑫", act: function () { window.open("assets/resume.pdf", "_blank"); } },
      { label: "GitHub 主页", hint: "zhouyuanxinand", act: function () { window.open("https://github.com/zhouyuanxinand", "_blank"); } },
      { label: "复制邮箱", hint: "3089729486@qq.com", act: function () {
          var em = "3089729486@qq.com";
          if (navigator.clipboard) navigator.clipboard.writeText(em);
          var t = document.createElement("div");
          t.className = "copy-toast show";
          t.innerHTML = "已复制到剪贴板：<b>" + em + "</b>";
          document.body.appendChild(t);
          setTimeout(function () { t.classList.remove("show"); setTimeout(function(){ t.remove(); }, 300); }, 2000);
        } },
      { label: "项目：Archify", hint: "自然语言生成架构图", act: function () { window.open("https://tt-a1i.github.io/archify/", "_blank"); } },
      { label: "项目：hiveteam", hint: "浏览器里的 Agent 团队", act: function () { window.open("https://zhouyuanxinand.github.io/hiveteam/", "_blank"); } },
      { label: "项目：simplify-codebase", hint: "代码简化与防回退", act: function () { window.open("https://zhouyuanxinand.github.io/code-janitor/", "_blank"); } },
    ];
    var cmdk = document.getElementById("cmdk");
    var cmdkInput = document.getElementById("cmdk-input");
    var cmdkList = document.getElementById("cmdk-list");
    var cmdkSel = 0;
    var cmdkFiltered = CMDS;
    function cmdkRender(q) {
      var n = (q || "").trim().toLowerCase();
      cmdkFiltered = n ? CMDS.filter(function (c) { return (c.label + c.hint).toLowerCase().includes(n); }) : CMDS;
      cmdkSel = 0;
      cmdkList.innerHTML = cmdkFiltered.map(function (c, i) {
        return '<button type="button" class="cmdk-item' + (i === 0 ? " sel" : "") + '" data-i="' + i + '">' +
          '<span class="ci-idx">' + String(i + 1).padStart(2, "0") + '</span>' +
          '<span class="ci-label">' + c.label + "</span>" +
          '<span class="ci-hint">' + c.hint + "</span></button>";
      }).join("");
    }
    function cmdkOpen() { cmdk.showModal(); cmdkRender(cmdkInput.value); cmdkInput.focus(); }
    if (cmdk && cmdkInput && cmdkList) {
      document.addEventListener("keydown", function (e) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); cmdkOpen(); }
        if (e.key === "Escape" && cmdk.open) cmdk.close();
      });
      cmdkInput.addEventListener("input", function () { cmdkRender(cmdkInput.value); });
      cmdkInput.addEventListener("keydown", function (e) {
        var items = cmdkList.querySelectorAll(".cmdk-item");
        if (!items.length) return;
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          cmdkSel = (cmdkSel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
          items.forEach(function (el, i) { el.classList.toggle("sel", i === cmdkSel); });
          items[cmdkSel].scrollIntoView({ block: "nearest" });
        }
        if (e.key === "Enter") {
          e.preventDefault();
          var c = cmdkFiltered[cmdkSel];
          if (c) { cmdk.close(); c.act(); }
        }
      });
      cmdkList.addEventListener("click", function (e) {
        var btn = e.target.closest(".cmdk-item");
        if (!btn) return;
        var c = cmdkFiltered[+btn.getAttribute("data-i")];
        if (c) { cmdk.close(); c.act(); }
      });
      cmdk.addEventListener("click", function (e) { if (e.target === cmdk) cmdk.close(); });
    }

    // 8. 英文字母解码：分区英文小标（PROJECTS 等）进入视口时收敛成型
    var secEns = document.querySelectorAll(".sec-en");
    if (secEns.length && noReduce) {
      var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var decodeText = function (el) {
        var target = el.getAttribute("data-final");
        var frame = 0, total = 20;
        var timer = setInterval(function () {
          frame++;
          el.textContent = target.split("").map(function (c, i) {
            if (c === " " || c === "/" || c === "·") return c;
            return frame / total > (i + 1) / target.length ? c
              : letters[Math.floor(Math.random() * 26)];
          }).join("");
          if (frame >= total) { el.textContent = target; clearInterval(timer); }
        }, 40);
      };
      secEns.forEach(function (el) { el.setAttribute("data-final", el.textContent); });
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { decodeText(e.target); so.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      secEns.forEach(function (el) { so.observe(el); });
    }

    // 滚动入场动画
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  });
})();
