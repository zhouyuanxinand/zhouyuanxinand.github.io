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
