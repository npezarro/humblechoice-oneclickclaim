// ==UserScript==
// @name         Humble Choice One-Click Claim
// @namespace    https://github.com/npezarro/humblechoice-oneclickclaim
// @version      1.0.0
// @description  Adds a floating button to Humble Choice pages that selects and claims all unclaimed games in one click
// @author       npezarro
// @match        https://www.humblebundle.com/membership/*
// @match        https://www.humblebundle.com/subscription/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/npezarro/humblechoice-oneclickclaim/main/humblechoice-oneclickclaim.user.js
// @updateURL    https://raw.githubusercontent.com/npezarro/humblechoice-oneclickclaim/main/humblechoice-oneclickclaim.user.js
// ==/UserScript==

(function () {
  "use strict";

  const SELECTORS = {
    multiselectToggle: ".choices-secondary-link.js-initialize-multiselect",
    gameCard: ".choice-image-container.js-admin-edit",
    contentChoice: ".content-choice",
    claimAll: ".choices-secondary-link.multi-claim.js-multi-claim",
  };

  const TIMING = {
    afterMultiselect: 500,
    betweenClicks: 50,
    beforeClaim: 300,
  };

  // ── UI ──

  function createButton() {
    const btn = document.createElement("button");
    btn.id = "hc-claim-btn";
    btn.textContent = "Claim All";
    Object.assign(btn.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: "99999",
      padding: "12px 24px",
      background: "#c43e66",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      transition: "opacity 0.2s, transform 0.2s",
    });
    btn.addEventListener("mouseenter", () => (btn.style.opacity = "0.85"));
    btn.addEventListener("mouseleave", () => (btn.style.opacity = "1"));
    btn.addEventListener("click", startClaim);
    document.body.appendChild(btn);
    return btn;
  }

  function createStatus() {
    const el = document.createElement("div");
    el.id = "hc-claim-status";
    Object.assign(el.style, {
      position: "fixed",
      bottom: "70px",
      right: "20px",
      zIndex: "99999",
      padding: "8px 16px",
      background: "rgba(0,0,0,0.8)",
      color: "#fff",
      borderRadius: "6px",
      fontSize: "13px",
      maxWidth: "300px",
      display: "none",
    });
    document.body.appendChild(el);
    return el;
  }

  function showStatus(msg) {
    statusEl.textContent = msg;
    statusEl.style.display = "block";
  }

  function hideStatus() {
    statusEl.style.display = "none";
  }

  function setButtonState(text, disabled) {
    claimBtn.textContent = text;
    claimBtn.disabled = disabled;
    claimBtn.style.opacity = disabled ? "0.6" : "1";
    claimBtn.style.cursor = disabled ? "default" : "pointer";
  }

  // ── Helpers ──

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function getUnclaimedBoxes() {
    const allBoxes = document.querySelectorAll(SELECTORS.gameCard);
    return Array.from(allBoxes).filter((box) => {
      const parent = box.closest(SELECTORS.contentChoice);
      return !parent || !parent.classList.contains("claimed");
    });
  }

  // ── Claim Flow ──

  async function startClaim() {
    if (claimBtn.disabled) return;

    setButtonState("Working...", true);

    // Step 1: Activate multiselect mode
    const toggle = document.querySelector(SELECTORS.multiselectToggle);
    if (!toggle) {
      showStatus("Multiselect button not found — are you on a Humble Choice page with available games?");
      setButtonState("Claim All", false);
      return;
    }

    toggle.click();
    showStatus("Multiselect mode activated");
    await sleep(TIMING.afterMultiselect);

    // Step 2: Find unclaimed items
    const unclaimed = getUnclaimedBoxes();
    const total = document.querySelectorAll(SELECTORS.gameCard).length;

    if (unclaimed.length === 0) {
      showStatus("No unclaimed items found — all games may already be claimed");
      setButtonState("Claim All", false);
      return;
    }

    showStatus(`Found ${unclaimed.length} unclaimed of ${total} total`);

    // Step 3: Click each unclaimed box
    for (let i = 0; i < unclaimed.length; i++) {
      unclaimed[i].click();
      setButtonState(`Selecting ${i + 1}/${unclaimed.length}...`, true);
      await sleep(TIMING.betweenClicks);
    }

    showStatus(`Selected ${unclaimed.length} items, claiming...`);
    await sleep(TIMING.beforeClaim);

    // Step 4: Click claim all
    const claimLink = document.querySelector(SELECTORS.claimAll);
    if (!claimLink) {
      showStatus("Claim button not found — items are selected but claim failed. Try clicking manually.");
      setButtonState("Claim All", false);
      return;
    }

    claimLink.click();
    showStatus(`Claimed ${unclaimed.length} games!`);
    setButtonState("Done!", true);

    // Reset after 5 seconds
    setTimeout(() => {
      setButtonState("Claim All", false);
      hideStatus();
    }, 5000);
  }

  // ── Init ──

  const claimBtn = createButton();
  const statusEl = createStatus();
})();
