const statusElement = document.getElementById("status");
const form = document.getElementById("stream-form");
const submitButton = document.getElementById("submit-button");

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

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildDefaultStreamName(tab) {
  const host = tab.url ? new URL(tab.url).hostname.replace(/\./g, "-") : "stream";
  const titlePart = tab.title ? slugify(tab.title).slice(0, 30) : "page";
  const suffix = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
  return `${host}-${titlePart || "stream"}-${suffix}`.slice(0, 80);
}

async function getSettings() {
  const result = await chrome.storage.sync.get({
    baseUrl: "",
    username: "",
    password: ""
  });
  return {
    baseUrl: normalizeBaseUrl(result.baseUrl || ""),
    username: (result.username || "").trim(),
    password: result.password || ""
  };
}

async function initFromActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) {
    setStatus("Could not identify the current tab.", "error");
    return;
  }

  document.getElementById("url").value = tab.url;
  document.getElementById("streamname").value = buildDefaultStreamName(tab);
  document.getElementById("streamdescription").value = tab.title || "";
}

function buildPayload(formData) {
  return {
    streamname: formData.get("streamname").trim(),
    streammethod: formData.get("streammethod"),
    streamdescription: formData.get("streamdescription").trim(),
    channelnumber: formData.get("channelnumber").trim(),
    logourl: formData.get("logourl").trim(),
    url: formData.get("url").trim(),
    streamprovider: formData.get("streamprovider").trim(),
    videoformat: formData.get("videoformat").trim(),
    videocodec: formData.get("videocodec").trim(),
    framesize: formData.get("framesize").trim(),
    framerate: formData.get("framerate").trim(),
    audiocodec: formData.get("audiocodec").trim(),
    title: formData.get("title").trim(),
    bitrate: formData.get("bitrate").trim() || "2000k"
  };
}

function validatePayload(payload) {
  if (!payload.url || !payload.streamname || !payload.streammethod) {
    return "Fill in URL, name, and method.";
  }
  if (payload.channelnumber && !/^\d+$/.test(payload.channelnumber)) {
    return "Channel number must contain digits only.";
  }
  return "";
}

async function addStreamServer(payload) {
  const settings = await getSettings();
  if (!settings.baseUrl) {
    throw new Error("Set the StreamProxy base URL in Options.");
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json"
  };

  if (settings.username) {
    headers.Authorization = `Basic ${btoa(`${settings.username}:${settings.password}`)}`;
  }

  const response = await fetch(`${settings.baseUrl}/api/streamserver`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  const responseText = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    parsed = { message: responseText };
  }

  if (!response.ok) {
    throw new Error(parsed.message || `HTTP error ${response.status}`);
  }

  return parsed;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Sending...", "");

  const payload = buildPayload(new FormData(form));
  const validationError = validatePayload(payload);
  if (validationError) {
    setStatus(validationError, "error");
    return;
  }

  submitButton.disabled = true;
  try {
    const result = await addStreamServer(payload);
    if (result.streamadded) {
      setStatus("Streamserver created successfully.", "success");
    } else {
      setStatus(result.message || "Could not create the streamserver.", "error");
    }
  } catch (error) {
    setStatus(error.message || "Failed to connect to StreamProxy.", "error");
  } finally {
    submitButton.disabled = false;
  }
});

initFromActiveTab().catch((error) => {
  setStatus(error.message || "Failed to load current tab data.", "error");
});
