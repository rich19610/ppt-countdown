(function () {
  "use strict";

  const STORAGE_KEY = "maxiai-ppt-countdown-settings";
  const TICK_MS = 160;
  const WARNING_MS = 10000;

  const elements = {
    form: document.getElementById("timerForm"),
    surface: document.getElementById("timerSurface"),
    minutes: document.getElementById("minutesInput"),
    seconds: document.getElementById("secondsInput"),
    start: document.getElementById("startButton"),
    pause: document.getElementById("pauseButton"),
    reset: document.getElementById("resetButton"),
    display: document.getElementById("timeDisplay"),
    progress: document.getElementById("progressBar"),
    status: document.getElementById("statusLine"),
  };

  const state = {
    mode: "ready",
    durationMs: 5 * 60 * 1000,
    remainingMs: 5 * 60 * 1000,
    endAt: 0,
    intervalId: 0,
  };

  function clampNumber(value, min, max) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      return min;
    }
    return Math.min(Math.max(parsed, min), max);
  }

  function readDurationFromInputs() {
    const minutes = clampNumber(elements.minutes.value, 0, 999);
    const seconds = clampNumber(elements.seconds.value, 0, 59);
    elements.minutes.value = String(minutes);
    elements.seconds.value = String(seconds);
    saveSettings(minutes, seconds);
    return (minutes * 60 + seconds) * 1000;
  }

  function saveSettings(minutes, seconds) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ minutes, seconds }));
    } catch (error) {
      // The add-in still works when storage is unavailable.
    }
  }

  function loadSettings() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
      if (Number.isInteger(saved.minutes) && Number.isInteger(saved.seconds)) {
        elements.minutes.value = String(clampNumber(saved.minutes, 0, 999));
        elements.seconds.value = String(clampNumber(saved.seconds, 0, 59));
      }
    } catch (error) {
      return;
    }
  }

  function formatTime(ms) {
    const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function setStatus(text, mode) {
    elements.status.textContent = text;
    elements.surface.dataset.state = mode;
  }

  function render() {
    elements.display.textContent = formatTime(state.remainingMs);

    const ratio = state.durationMs > 0 ? Math.max(0, Math.min(1, state.remainingMs / state.durationMs)) : 0;
    elements.progress.style.width = `${ratio * 100}%`;

    elements.start.hidden = state.mode === "running";
    elements.pause.hidden = state.mode !== "running";

    elements.minutes.disabled = state.mode === "running";
    elements.seconds.disabled = state.mode === "running";

    if (state.mode === "running" && state.remainingMs <= WARNING_MS && state.remainingMs > 0) {
      setStatus("即将结束", "warning");
      return;
    }

    const statusByMode = {
      ready: "准备",
      running: "进行中",
      paused: "已暂停",
      done: "时间到",
      invalid: "请设置时间",
    };
    setStatus(statusByMode[state.mode] || "准备", state.mode);
  }

  function clearTimer() {
    if (state.intervalId) {
      window.clearInterval(state.intervalId);
      state.intervalId = 0;
    }
  }

  function finish() {
    clearTimer();
    state.mode = "done";
    state.remainingMs = 0;
    document.title = "时间到";
    render();
  }

  function tick() {
    state.remainingMs = Math.max(0, state.endAt - Date.now());
    if (state.remainingMs <= 0) {
      finish();
      return;
    }
    render();
  }

  function start() {
    if (state.mode === "ready" || state.mode === "done" || state.mode === "invalid") {
      state.durationMs = readDurationFromInputs();
      state.remainingMs = state.durationMs;
    }

    if (state.remainingMs <= 0) {
      clearTimer();
      state.mode = "invalid";
      render();
      return;
    }

    clearTimer();
    state.mode = "running";
    state.endAt = Date.now() + state.remainingMs;
    document.title = "倒计时";
    state.intervalId = window.setInterval(tick, TICK_MS);
    tick();
  }

  function pause() {
    if (state.mode !== "running") {
      return;
    }
    state.remainingMs = Math.max(0, state.endAt - Date.now());
    clearTimer();
    state.mode = "paused";
    render();
  }

  function reset() {
    clearTimer();
    state.durationMs = readDurationFromInputs();
    state.remainingMs = state.durationMs;
    state.mode = state.durationMs > 0 ? "ready" : "invalid";
    document.title = "发言倒计时";
    render();
  }

  function handleInputChange() {
    if (state.mode === "running") {
      return;
    }
    state.durationMs = readDurationFromInputs();
    state.remainingMs = state.durationMs;
    state.mode = state.durationMs > 0 ? "ready" : "invalid";
    render();
  }

  elements.form.addEventListener("submit", function (event) {
    event.preventDefault();
    start();
  });

  elements.pause.addEventListener("click", pause);
  elements.reset.addEventListener("click", reset);
  elements.minutes.addEventListener("change", handleInputChange);
  elements.seconds.addEventListener("change", handleInputChange);
  elements.minutes.addEventListener("input", handleInputChange);
  elements.seconds.addEventListener("input", handleInputChange);

  document.addEventListener("visibilitychange", function () {
    if (state.mode === "running") {
      tick();
    }
  });

  loadSettings();
  reset();
})();
