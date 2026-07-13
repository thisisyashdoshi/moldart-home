"use strict";

/* Chatbot Widget — exposes initChatbot() for main.js */
function initChatbot() {
  var toggle = document.getElementById("chatbot-toggle");
  var win = document.getElementById("chatbot-window");
  var input = document.getElementById("chatbot-input");
  var send = document.getElementById("chatbot-send");
  var messages = document.getElementById("chatbot-messages");
  if (!toggle || !win) return;

  var history = [{ role: "system", content: "You are Moldart Assistant for Moldart — a B2B sourcing and supply partner for wood and steel product routes. Moldart works across press plates, press pads, engraved cylinders, printed decor paper, plywood, MDF/HDF, OSB, particleboard, wood flooring, flooring accessories, ready-made furniture, custom furniture, decorative stainless steel panels, SS profiles, SS furniture, and industrial press plates for HPL/CCL/PCB routes. Founded in 1989 and based in Mumbai. Be concise, factual, and helpful. For pricing or custom specs, suggest contacting info@moldartindia.com or WhatsApp +91 7208088788. Never fabricate specifications or company claims." }];

  function esc(s) { var d = document.createElement("div"); d.appendChild(document.createTextNode(s)); return d.innerHTML; }

  toggle.addEventListener("click", function() {
    win.classList.toggle("is-open");
    toggle.classList.toggle("is-open");
    if (win.classList.contains("is-open") && input) setTimeout(function() { input.focus(); }, 100);
  });

  function addMsg(text, role) {
    var div = document.createElement("div");
    div.className = "chatbot-msg " + role;
    div.innerHTML = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    var el = document.createElement("div");
    el.className = "chatbot-typing";
    el.id = "chatbot-typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById("chatbot-typing");
    if (el) el.remove();
  }

  function doSend() {
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    addMsg(esc(text), "user");
    history.push({ role: "user", content: text });
    showTyping();

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-10) })
    })
    .then(function(res) {
      hideTyping();
      if (!res.ok) {
        if (res.status === 429) {
          addMsg("Daily message limit reached. Please contact <a href='mailto:info@moldartindia.com'>info@moldartindia.com</a> or WhatsApp +91 7208088788.", "bot");
          return;
        }
        addMsg("Connection issue. Please contact <a href='mailto:info@moldartindia.com'>info@moldartindia.com</a>.", "bot");
        return;
      }
      return res.json();
    })
    .then(function(data) {
      if (!data) return;
      var reply = data.reply || "Could not generate a response. Please contact our team.";
      history.push({ role: "assistant", content: reply });
      addMsg(reply.replace(/\n/g, "<br>"), "bot");
    })
    .catch(function() {
      hideTyping();
      addMsg("Connection error. Reach us via WhatsApp at +91 7208088788.", "bot");
    });
  }

  if (send) send.addEventListener("click", doSend);
  if (input) input.addEventListener("keydown", function(e) { if (e.key === "Enter") doSend(); });

  addMsg("Hello! I'm the Moldart Assistant. How can I help you today? I can answer questions about our products, specifications, and services.", "bot");
}

/* Insights Filter — exposes initInsightsFilter() for main.js */
function initInsightsFilter() {
  var grid = document.getElementById("insights-grid");
  if (!grid) return;
  var btns = document.querySelectorAll(".insights-filter-btn");
  if (!btns.length) return;
  btns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      btns.forEach(function(b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var filter = btn.dataset.filter;
      grid.querySelectorAll(".insight-card").forEach(function(card) {
        card.style.display = (filter === "all" || card.dataset.category === filter) ? "" : "none";
      });
    });
  });
}
