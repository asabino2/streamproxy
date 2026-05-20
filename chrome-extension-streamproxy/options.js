const form = document.getElementById("options-form");
const statusElement = document.getElementById("status");

function setStatus(message, type) {
  statusElement.textContent = message;
  statusElement.className = "status";
  if (type) {
    statusElement.classList.add(type);
  }
}

function normalizeBaseUrl(baseUrl) {
  return baseUrl.trim().replace(/\/$/, "");
}

async function loadOptions() {
  const saved = await chrome.storage.sync.get({
    baseUrl: "",
    username: "",
    password: ""
  });

  document.getElementById("baseUrl").value = saved.baseUrl || "";
  document.getElementById("username").value = saved.username || "";
  document.getElementById("password").value = saved.password || "";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const baseUrl = normalizeBaseUrl(document.getElementById("baseUrl").value);
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!/^https?:\/\//i.test(baseUrl)) {
    setStatus("Base URL must start with http:// or https://", "error");
    return;
  }

  await chrome.storage.sync.set({
    baseUrl,
    username,
    password
  });

  setStatus("Settings saved.", "success");
});

loadOptions().catch((error) => {
  setStatus(error.message || "Could not load settings.", "error");
});
