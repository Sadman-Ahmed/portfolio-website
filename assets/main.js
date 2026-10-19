(function () {
  var d = document, h = d.documentElement, reduce = matchMedia("(prefers-reduced-motion:reduce)").matches, fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  function $(s) { return d.querySelector(s) }
  function $$(s) { return [].slice.call(d.querySelectorAll(s)) }
  var t = $("#t"); function tick() { if (t) t.textContent = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dhaka" }) } tick(); setInterval(tick, 30000);
  var y = $("#y"); if (y) y.textContent = new Date().getFullYear();
  /* menu */
  var mb = $("#menubtn"), mn = $("#menu");
  function menu(o) { mn.classList.toggle("open", o); mb.setAttribute("aria-expanded", o); mb.textContent = o ? "Close" : "Menu"; mn.inert = !o }
  mn.inert = true; mb.addEventListener("click", function () { menu(!mn.classList.contains("open")) });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape") menu(false) });
  var p = $("#pause"); if (p) p.addEventListener("click", function () { var s = h.classList.toggle("paused"); p.textContent = s ? "(Play motion)" : "(Pause motion)" });
  /* title: split into letters that rise in one by one */
  var n = 0; $$("h1 span b").forEach(function (b) { b.setAttribute("aria-hidden", "true"); b.innerHTML = b.textContent.split("").map(function (c) { return '<i class="ch" style="animation-delay:' + (.5 + n++ * .055) + 's">' + c + '</i>' }).join("") });
  /* title: letters swell toward the pointer (variable font weight + width) */
  var chars = $$(".ch");
  if (fine && !reduce && chars.length) {
    var mx = -999, my = -999, raf = 0;
    function prox() { raf = 0; if (h.classList.contains("paused")) return; chars.forEach(function (c) { var r = c.getBoundingClientRect(), k = Math.max(0, 1 - Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2)) / 340); c.style.fontVariationSettings = '"wght" ' + Math.round(600 + k * 300) + ',"wdth" ' + Math.round(90 + k * 35) }) }
    addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(prox) });
    d.documentElement.addEventListener("pointerleave", function () { mx = my = -999; prox() });
  }
  /* custom cursor */
  if (fine && !reduce) {
    h.classList.add("fine");
    var ring = $(".cur"), dot = $(".dot"), lab = ring.firstElementChild, x = 0, yy = 0, rx = 0, ry = 0;
    addEventListener("pointermove", function (e) { x = e.clientX; yy = e.clientY; dot.style.transform = "translate(" + x + "px," + yy + "px)"; ring.classList.add("show"); dot.classList.add("show") });
    (function loop() { rx += (x - rx) * .16; ry += (yy - ry) * .16; ring.style.transform = "translate(" + rx + "px," + ry + "px)"; requestAnimationFrame(loop) })();
    d.addEventListener("pointerover", function (e) { var el = e.target.closest("[data-cursor],a,button,summary"), s = "cur show" + (el ? (el.dataset.cursor ? " label" : " hot") : ""); ring.className = s; lab.textContent = el && el.dataset.cursor || "" });
    h.addEventListener("pointerleave", function () { ring.classList.remove("show"); dot.classList.remove("show") });
    /* magnetic buttons */
    $$("[data-mag]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); el.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * .3 + "px," + (e.clientY - r.top - r.height / 2) * .4 + "px)" });
      el.addEventListener("pointerleave", function () { el.style.transform = "" });
    });
  }
  /* word reveal + fade-ups + terminal */
  $$("[data-split]").forEach(function (el) { el.setAttribute("aria-label", el.textContent.trim()); el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w, i) { return '<span class="w" aria-hidden="true" style="transition-delay:' + i * 35 + 'ms">' + w + '</span> ' }).join("") });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; var el = e.target; el.classList.add("on"); io.unobserve(el);
      if (el.hasAttribute("data-term")) [].forEach.call(el.querySelectorAll(".tl"), function (l, i) { setTimeout(function () { l.classList.add("on") }, reduce ? 0 : i * 450) })
    })
  }, { threshold: .2 });
  $$("[data-r],.w,[data-term]").forEach(function (el) { io.observe(el) });
  /* phone: live timer + pointer tilt */
  var ph = $("#phone");
  if (ph) {
    var tabs = $$("[data-mode]"), mode = "pomo", t0 = Date.now(), tm = $("#ptime"), rg = $("#pring");
    tabs.forEach(function (b) { b.addEventListener("click", function () { mode = b.dataset.mode; t0 = Date.now(); tabs.forEach(function (x) { x.setAttribute("aria-pressed", x === b) }) }) });
    function f(s) { return ("0" + Math.floor(s / 60)).slice(-2) + ":" + ("0" + s % 60).slice(-2) }
    setInterval(function () { var s = Math.floor((Date.now() - t0) / 1000); if (mode === "pomo") { tm.textContent = f(Math.max(0, 1500 - s)); rg.style.setProperty("--p", Math.min(100, s / 15)) } else { tm.textContent = f(s % 3600); rg.style.setProperty("--p", (s % 60) / .6) } }, 250);
    if (fine && !reduce) { var w = ph.parentNode; w.addEventListener("pointermove", function (e) { var r = w.getBoundingClientRect(); ph.style.setProperty("--ry", ((e.clientX - r.left) / r.width - .5) * 22 + "deg"); ph.style.setProperty("--rx", ((e.clientY - r.top) / r.height - .5) * -22 + "deg") }); w.addEventListener("pointerleave", function () { ph.style.setProperty("--rx", "0deg"); ph.style.setProperty("--ry", "0deg") }) }
  }
  /* page transition / preloader: shows the name of the page you are going to */
  var tr = $(".tr"), cnt = $("#cnt"), pn = $("#pname"), lb = $("#lbl"), NAMES = { index: "Home", work: "Work", about: "About", services: "Services", security: "Security", apps: "Apps", resume: "Resume", contact: "Contact" };
  function nm(path) { var f = path.split("/").pop().replace(".html", "") || "index"; return NAMES[f] || "Home" }
  function count(ms, done) { var c = +cnt.textContent || 0, iv = setInterval(function () { c = Math.min(100, c + 9); cnt.textContent = ("00" + c).slice(-3); if (c >= 100) { clearInterval(iv); if (done) done() } }, ms); return iv }
  function lift() {
    h.classList.remove("cover", "via"); tr.classList.add("up");
    tr.addEventListener("transitionend", function f() { tr.removeEventListener("transitionend", f); tr.style.transition = "none"; tr.classList.remove("up"); tr.offsetHeight; tr.style.transition = "" })
  }
  if (tr && !reduce) {
    if (h.classList.contains("cover")) {
      if (h.classList.contains("via")) { cnt.textContent = "100"; setTimeout(lift, 250) }
      else { lb.textContent = "(Loading)"; count(45, function () { setTimeout(lift, 250) }) }
    }
    d.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || a.origin !== location.origin || a.pathname === location.pathname) return;
      e.preventDefault(); sessionStorage.setItem("tr", "1");
      pn.textContent = nm(a.pathname); lb.textContent = "(Next)"; cnt.textContent = "000"; tr.classList.add("in");
      var iv = count(55); setTimeout(function () { clearInterval(iv); location.href = a.href }, 720);
    });
    addEventListener("pageshow", function (e) { if (e.persisted) { tr.classList.remove("in"); cnt.textContent = "000" } });
  }
  /* contact form: posts to Web3Forms; falls back to the visitor's email app until a key is added */
  var cf = $("#cf");
  if (cf) {
    var st = $("#fs"), btn = cf.querySelector("button");
    cf.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(cf), key = String(fd.get("access_key") || "");
      if (fd.get("botcheck")) return;
      if (!key || /YOUR_ACCESS_KEY/.test(key)) {
        var body = "Name: " + fd.get("name") + "\nEmail: " + fd.get("email") + "\nOrganization: " + (fd.get("organization") || "-") + "\nTopic: " + (fd.get("topic") || "-") + "\n\n" + fd.get("message");
        location.href = "mailto:sdmn.ahmd@gmail.com?subject=" + encodeURIComponent("Message from " + fd.get("name")) + "&body=" + encodeURIComponent(body);
        st.textContent = "Opening your email app..."; return;
      }
      btn.disabled = true; btn.textContent = "Sending..."; st.textContent = "";
      fetch(cf.action, { method: "POST", headers: { Accept: "application/json" }, body: fd }).then(function (r) { return r.json() }).then(function (r) {
        if (!r.success) throw 0; cf.hidden = true; $("#thanks").hidden = false;
      }).catch(function () { btn.disabled = false; btn.textContent = "Send message \u2192"; st.textContent = "Something went wrong. Please email me at sdmn.ahmd@gmail.com." });
    });
  }
  var pr = $("#print"); if (pr) pr.addEventListener("click", function () { print() });
})();
