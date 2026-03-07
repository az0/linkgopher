'use strict';
const containerLinks = document.getElementById('links');
const containerDomains = document.getElementById('domains');
const message = document.getElementById('message');
const searchInput = document.getElementById('search-input');
const reBaseURL = /(^\w+:\/\/[^\/]+)|(^[A-Za-z0-9.-]+)\/|(^[A-Za-z0-9.-]+$)/;
const tabId = parseInt(location.search.replace(/.*tabId=(\d+).*/, '$1'));
const filtering = location.search.replace(/.*filtering=(true|false).*/, '$1');
const pattern = filtering === 'true'
  ? window.prompt(chrome.i18n.getMessage('askPattern'))
  : null;
const filteringDomains = location
  .search.replace(/.*filteringDomains=(true|false).*/, '$1') === 'true'
  ? true
  : false;
const onlyDomains = location.search.replace(/.*onlyDomains=(true|false).*/, '$1');

chrome.tabs.sendMessage(tabId, {action: 'extract'}, links => {
  handler(links || [], pattern, onlyDomains);
});

// Localization.
[
  {id: 'links', messageId: 'links'},
  {id: 'domains', messageId: 'domains'},
  {id: 'message', messageId: 'pleaseWait'}
].forEach(item => {
  const container = document.getElementById(item.id);
  container.dataset.content = chrome.i18n.getMessage(item.messageId);
})

/**
 * @function handler
 * @param {Array} links
 * @param {string} pattern -- Pattern for filtering.
 * @param onlyDomains
 */
function handler(links, pattern, onlyDomains) {
  if (chrome.runtime.lastError) {
    return window.alert(chrome.runtime.lastError);
  }

  // Filter out javascript:void(0) style non-URL links.
  const resLinks = links.filter(link => link.lastIndexOf('://', 10) > 0);
  // Remove duplicates, sort.
  const items = [...(new Set(resLinks))].sort();
  const re = pattern ? new RegExp(pattern, 'g') : null;
  const added = items.filter(link => addNodes(link, containerLinks, re, onlyDomains));

  if (!added.length) {
    message.dataset.content = chrome.i18n.getMessage('noMatches');
    updateToolbar([], []);
    return;
  }

  // Extract base URL, dedupe, sort.
  const domains = [...(new Set(added.map(link => getBaseURL(link)).filter(Boolean)))].sort();
  const reDomains = filteringDomains ? re : null;
  domains.forEach(domain => addNodes(domain, containerDomains, reDomains, onlyDomains));

  updateCounts(added.length, domains.length);
  updateToolbar(added, domains);
  initSearch();
};

/**
 * Update section header counts.
 */
function updateCounts(linkCount, domainCount) {
  const linkLabel = chrome.i18n.getMessage('links') || 'Links';
  const domainLabel = chrome.i18n.getMessage('domains') || 'Domains';
  containerLinks.dataset.content = `${linkLabel} (${linkCount})`;
  containerDomains.dataset.content = `${domainLabel} (${domainCount})`;
}

/**
 * Wire up toolbar copy/download buttons.
 */
function updateToolbar(linkList, domainList) {
  document.getElementById('copy-links').addEventListener('click', () => {
    copyToClipboard(linkList.join('\n'), document.getElementById('copy-links'));
  });

  document.getElementById('copy-domains').addEventListener('click', () => {
    copyToClipboard(domainList.join('\n'), document.getElementById('copy-domains'));
  });

  document.getElementById('download-links').addEventListener('click', () => {
    const content = ['=== Links ===', ...linkList, '', '=== Domains ===', ...domainList].join('\n');
    downloadFile(content, 'links.txt');
  });
}

/**
 * Copy text to clipboard, briefly show feedback on button.
 */
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.innerHTML;
    btn.innerHTML = '&#10003; Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.innerHTML = original; btn.classList.remove('copied'); }, 1500);
  });
}

/**
 * Trigger a .txt file download.
 */
function downloadFile(content, filename) {
  const blob = new Blob([content], {type: 'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * Live search filter across all rendered link anchors.
 */
function initSearch() {
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();
    document.querySelectorAll('#links a, #domains a').forEach(a => {
      const visible = !term || a.href.toLowerCase().includes(term);
      a.style.display = visible ? '' : 'none';
      a.nextSibling && (a.nextSibling.style && (a.nextSibling.style.display = visible ? '' : 'none'));
    });
  });
}

/**
 * Add nodes to container.
 *
 * @function addNodes
 * @param url
 * @param {Node} container
 * @param {object|null} re -- Regular Expression pattern.
 * @param onlyDomains
 * @return {boolean} -- Whether link was added into document.
 */
function addNodes(url, container, re, onlyDomains) {
  if (re && !url.match(re)) return false;

  if (onlyDomains === 'true' && container === containerLinks) {
    return true;
  }

  const a = document.createElement('a');
  a.href = url;
  a.innerText = url;
  container.appendChild(a);
  container.appendChild(document.createElement('br'));

  return true;
};

/**
 * Get base URL of link.
 *
 * @function getBaseURL
 * @param {string} link
 */
function getBaseURL(link) {
  const result = link.match(reBaseURL);

  if (!result) {
    return null;
  } else if (result[1]) {
    return `${result[1]}/`;
  } else {
    return `http://${result[2] || result[3]}/`;
  }
};
