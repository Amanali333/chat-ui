/* chat-loader.js  –  v1.2  (Font-Awesome robot icon) */

(function (d, cfg) {
  /* ── 1. session id ────────────────────────────────────────── */
  // const uuid = () =>
  //     (crypto.randomUUID && crypto.randomUUID()) ||
  //     "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
  //         const r = (Math.random() * 16) | 0;
  //         return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  //     });

  const uuid = () => {
    const arr = new Uint16Array(1);
    crypto.getRandomValues(arr); // cryptographically-strong RNG
    return String(arr[0] % 10000).padStart(4, "0"); // "0732" etc.
  };

  const sessionId =
    localStorage.getItem("session_id") ||
    (localStorage.setItem("session_id", uuid()),
    localStorage.getItem("session_id"));

  window.Chat360_SessionId = sessionId;

  /* ── 2. cfg merge ─────────────────────────────────────────── */
  cfg = Object.assign(
    {
      url: "https://connect.dental360grp.com/webchat",
      color: "#146ef5",
      title: "AI Assistant",
    },
    window.ChatBot_Config || {}
  );
  cfg.url +=
    (cfg.url.includes("?") ? "&" : "?") +
    "session_id=" +
    encodeURIComponent(sessionId) +
    "&color=" +
    encodeURIComponent(cfg.color) +
    "&title=" +
    encodeURIComponent(cfg.title);

  /* ── 3. Font-Awesome once ─────────────────────────────────── */
  if (!d.querySelector("link[data-chat360-fa]")) {
    const fa = d.createElement("link");
    fa.rel = "stylesheet";
    fa.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
    fa.setAttribute("data-chat360-fa", "");
    d.head.appendChild(fa);
  }

  /* ── 4. build UI after DOM ready ─────────────────────────── */
  function init() {
    // const gap = 20, W = 380, H = 520;
    const gap = 20; // same gap
    const MOBILE_BP = 600; // breakpoint
    const isMobile = window.matchMedia(`(max-width:${MOBILE_BP}px)`).matches;
    const W = isMobile ? window.innerWidth : 380; // full-width on mobile
    const H = isMobile ? window.innerHeight : 520; // full-height on mobile

    /* launcher */
    const btn = d.createElement("button");
    btn.innerHTML = '<i class="fa-solid fa-robot" aria-label="Open chat"></i>';
    btn.style.cssText = `position:fixed;bottom:${gap}px;right:${gap}px;z-index:9998;
      width:48px;height:48px;border:none;border-radius:50%;background:${cfg.color};
      color:#fff;font-size:22px;display:flex;align-items:center;justify-content:center;
      cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.15);transition:transform .25s ease`;

    /* iframe (hidden + animation origin) */
    const frame = d.createElement("iframe");
    frame.src = cfg.url;
    frame.allowTransparency = "true";
    frame.style.cssText = `position:fixed;bottom:${
      gap + 60
    }px;right:${gap}px;width:${W}px;
  max-width:calc(100vw - 40px);height:${H}px;max-height:520px;
  border:none;border-radius:8px;display:block;opacity:0;pointer-events:none;
  transform:scale(.75);transform-origin:bottom right;z-index:9999;
  box-shadow:0 4px 12px rgba(0,0,0,.25);transition:transform .25s ease,opacity .25s ease`;

    //     frame.style.cssText = `position:fixed;bottom:${gap + 60}px;right:${gap}px;width:${W}px;height:${H}px;
    //   border:none;border-radius:8px;display:block;opacity:0;pointer-events:none;
    //   transform:scale(.75);transform-origin:bottom right;z-index:9999;
    //   box-shadow:0 4px 12px rgba(0,0,0,.25);transition:transform .25s ease,opacity .25s ease`;

    let open = false;
    const robotIcon =
      '<i class="fa-solid fa-robot" aria-label="Open chat"></i>';
    const closeIcon =
      '<i class="fa-solid fa-xmark" aria-label="Close chat"></i>';

    btn.onclick = () => {
      open = !open;
      btn.innerHTML = open ? closeIcon : robotIcon;

      if (open) {
        frame.style.pointerEvents = "auto";
        requestAnimationFrame(() => {
          frame.style.opacity = "1";
          frame.style.transform = "scale(1)";
        });
      } else {
        frame.style.opacity = "0";
        frame.style.transform = "scale(.75)";
        frame.style.pointerEvents = "none";
      }
    };

    d.body.append(btn, frame);
  }

  d.readyState === "loading"
    ? d.addEventListener("DOMContentLoaded", init)
    : init();
})(document);

// Custom Style

// (function (d, cfg) {

//     /* ── 1. figure out session_id ───────────────────────────── */
//     const uuid = () =>
//         (crypto.randomUUID && crypto.randomUUID()) ||
//         "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
//             const r = (Math.random() * 16) | 0;
//             return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
//         });

//     const sessionId =
//         localStorage.getItem("session_id") ||
//         (function () {
//             const id = uuid();
//             localStorage.setItem("session_id", id);
//             return id;
//         })();

//     window.Chat360_SessionId = sessionId;     // ← global helper

//     /* ── 2. merge per-site overrides ────────────────────────── */
//     cfg = Object.assign(
//         {
//             url: "https://connect.dental360grp.com/webchat", // base widget URL
//             color: "#146ef5",
//         },
//         window.ChatBot_Config || {}
//     );

//     /* tack session_id onto iframe url */
//     const urlHasQuery = cfg.url.includes("?");
//     cfg.url += (urlHasQuery ? "&" : "?") + "session_id=" + encodeURIComponent(sessionId);

//     /* ── 3. ensure Font Awesome once ────────────────────────── */
//     if (!d.querySelector("link[data-chat360-fa]")) {
//         const fa = d.createElement("link");
//         fa.rel = "stylesheet";
//         fa.href =
//             "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
//         fa.setAttribute("data-chat360-fa", "");
//         d.head.appendChild(fa);
//     }

//     /* ── 4. build launcher & iframe when DOM ready ──────────── */
//     function init() {
//         const gap = 20,
//             W = 380,
//             H = 520;

//         /* launcher */
//         const btn = d.createElement("button");
//         btn.innerHTML = '<i class="fa-solid fa-robot"></i>';
//         btn.style.cssText = `position:fixed;bottom:${gap}px;right:${gap}px;z-index:9998;
//         width:48px;height:48px;border:none;border-radius:50%;background:${cfg.color};
//         color:#fff;font-size:22px;display:flex;align-items:center;justify-content:center;
//         cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.15)`;

//         /* iframe (hidden) */
//         const frame = d.createElement("iframe");
//         frame.src = cfg.url;
//         frame.allowTransparency = "true";
//         frame.style.cssText = `position:fixed;bottom:${gap + 60}px;right:${gap}px;width:${W}px;height:${H}px;
//         border:none;border-radius:8px;display:none;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.25)`;

//         btn.onclick = () => {
//             frame.style.display = frame.style.display === "none" ? "block" : "none";
//         };

//         d.body.append(btn, frame);
//     }

//     d.readyState === "loading"
//         ? d.addEventListener("DOMContentLoaded", init)
//         : init();
// })(document);

// Working Fine

// (function (d, cfg) {

//     /* Merge per-site overrides */
//     cfg = Object.assign({
//         url: "https://connect.dental360grp.com/webchat",
//         color: "#146ef5"
//     }, window.ChatBot_Config || {});

//     /* ─── Ensure Font Awesome loaded ───────────────────────── */
//     if (!d.querySelector('link[data-chat360-fa]')) {
//         var fa = d.createElement("link");
//         fa.rel = "stylesheet";
//         fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
//         fa.setAttribute("data-chat360-fa", "");          // marker to avoid duplicates
//         d.head.appendChild(fa);
//     }

//     /* ─── Wait for DOM ready ───────────────────────────────── */
//     function init() {
//         const gap = 20, W = 380, H = 520;

//         /* Launcher button */
//         const btn = d.createElement("button");
//         btn.innerHTML = '<i class="fa-solid fa-robot"></i>';   // 👈 robot icon
//         btn.style.cssText = `position:fixed;bottom:${gap}px;right:${gap}px;z-index:9998;
//         width:48px;height:48px;border:none;border-radius:50%;background:${cfg.color};
//         color:#fff;font-size:22px;display:flex;align-items:center;justify-content:center;
//         cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.15)`;

//         /* Chat iframe (hidden by default) */
//         const frame = d.createElement("iframe");
//         frame.src = cfg.url;
//         frame.style.cssText = `position:fixed;bottom:${gap + 60}px;right:${gap}px;width:${W}px;height:${H}px;
//         border:none;border-radius:8px;display:none;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.25)`;

//         btn.onclick = () => { frame.style.display = frame.style.display === "none" ? "block" : "none"; };

//         d.body.append(btn, frame);
//     }

//     (d.readyState === "loading")
//         ? d.addEventListener("DOMContentLoaded", init)
//         : init();

// })(document);

// Old Working Fine

// /* chat-loader.js  –  v1.0 */
// (function (d, cfg) {
//     cfg = Object.assign({
//         url: "https://connect.dental360grp.com/connect-chatbot", // iframe URL
//         color: "#146ef5"                                         // launcher color
//     }, window.ChatBot_Config || {});

//     const gap = 20, W = 380, H = 520;
//     const btn = d.createElement("button"), frame = d.createElement("iframe");

//     btn.textContent = "💬";
//     btn.style.cssText = `position:fixed;bottom:${gap}px;right:${gap}px;z-index:9998;
//       width:48px;height:48px;border-radius:50%;border:none;background:${cfg.color};
//       color:#fff;font:20px/48px sans-serif;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.15)`;

//     frame.src = cfg.url;
//     frame.style.cssText = `position:fixed;bottom:${gap + 60}px;right:${gap}px;width:${W}px;height:${H}px;
//       border:none;border-radius:8px;display:none;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.25)`;

//     btn.onclick = () => { frame.style.display = frame.style.display === "none" ? "block" : "none"; };

//     d.body.append(btn, frame);
// })(document);
