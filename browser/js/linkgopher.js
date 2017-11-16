'use strict';
const containerLinks = document.getElementById('links');
const containerDomains = document.getElementById('domains');
const message = document.getElementById('message');
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

chrome.tabs.sendMessage(tabId, {action: 'extract'}, links => {
  handler(links, pattern);
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
 * @param {array} urls -- Array of links.
 * @param {string} pattern -- Pattern for filtering.
 */
function handler(links, pattern) {
  if (chrome.runtime.lastError) {
    return window.alert(chrome.runtime.lastError);
  }

  // To filter links like: javascript:void(0)
  const resLinks = links.filter(link => link.lastIndexOf('://', 10) > 0);
  // Remove duplicate, sorting of links.
  const items = [...(new Set(resLinks))].sort();
  const re = pattern ? new RegExp(pattern, 'g') : null;
  const added = items.filter(link => addNodes(link, containerLinks, re));

  if (!added.length) {
    return message.dataset.content = chrome.i18n.getMessage('noMatches');
  }
  // Extract base URL from link, remove duplicate, sorting of domains.
  const domains = [...(new Set(added.map(link => getBaseURL(link))))].sort();
  const reDomains = filteringDomains ? re : null;
  domains.forEach(domain => addNodes(domain, containerDomains, reDomains));
};

/**
 * Add nodes to container.
 *
 * @function addNodes
 * @param {string} link
 * @param {Node} container
 * @param {object|null} re -- Regular Expression pattern.
 * @return {boolean} -- Whether link added into document.
 */
function addNodes(url, container, re) {
  if (re && !url.match(re)) return false;

  const br = document.createElement('br');
  const a = document.createElement('a');
  a.href = url;
  a.innerText = url;
  container.appendChild(a);
  container.appendChild(br);

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
