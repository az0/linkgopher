/**
 * @function handler
 * @param {boolean} filtering
 */
 export function handler(filtering = false) {
  var tabId;

  return getCurrentTab()
    .then(items => { tabId = items[0].id; return injectScript(tabId); })
    .then(item => {
      const url = `${chrome.extension.getURL('browser/linkgopher.html')}?` +
                  `tabId=${tabId}&filtering=${filtering}`;
      return openTab(url);
    })
    .catch(error => window.alert(error));
};

/**
 * Get active tab of current window.
 *
 * @function getCurrentTab
 */
function getCurrentTab() {
  return new Promise((res, rej) => {
    const queryInfo = {
      active: true,
      currentWindow: true
    };

    chrome.tabs.query(queryInfo, items => passNext(items, res, rej));
  });
};

/**
 * Create tab with extension's page.
 *
 * @function openTab
 * @param {string} url
 */
export function openTab(url) {
  return new Promise((res, rej) => {
    const createProperties = {active: true, url};
    chrome.tabs.create(createProperties, tab => passNext(tab, res, rej));
  });
};

/**
 * Inject script into tab
 *
 * @function injectScript
 * @param {number} tabId -- The ID of tab.
 * @param {string} file -- Pathname of script
 */
function injectScript(tabId, file = '/content-script.js') {
  return new Promise((res, rej) => {
    const details = {
      file,
      runAt: 'document_start'
    };

    chrome.tabs.executeScript(tabId, details, item => passNext(item, res, rej));
  });
};

/**
 * @function passNext
 * @param {*} result
 * @param {function} fulfill
 * @param {function} reject
 */
function passNext(result, fulfill, reject) {
  if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
  return fulfill(result);
};
