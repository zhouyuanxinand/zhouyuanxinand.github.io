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

    // Hero：打字机逐字打出问候语，完成后光标蓝芒闪耀
    var heroH1 = document.querySelector(".hero-mono");
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
            cursor.before(document.createTextNode(ch));
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
