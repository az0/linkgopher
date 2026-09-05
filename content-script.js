'use strict';
chrome.runtime.onMessage.addListener(onMessage);

/**
 * @function onMessage
 * @param {object} message
 * @param {runtime.MessageSender} sender
 *  Representing the sender of the message.
 * @param {function} sendResponse
 *  A function to call, at most once, to send a response to the message.
 */
function onMessage(message, sender, sendResponse) {
  if (message.action === 'extract') {
    sendResponse(extractLinks());
  } else {
    throw new Error('Unknown type of message');
  }
};

/**
 * Extract links.
 *
 * @function extractLinks
 */
function extractLinks() {
  const links = [];
  const push = url => {
    if (!url) return;
    try {
      links.push(decodeURI(url));
    } catch (e) {
      links.push(url);
    }
  };

  // Recurse into open shadow roots so that links rendered by web
  // components (e.g. archive.org's lit-based <app-root>) are collected.
  // document.links and querySelectorAll do not pierce shadow boundaries.
  // See issue #83.
  const visit = root => {
    root.querySelectorAll('a[href], area[href]').forEach(el => push(el.href));
    // document.links covers only <a> and <area>; also collect embedded
    // resources (<iframe>, <embed>, <object>) so pages that embed videos
    // via <iframe src=".../embed/..."> report all links. See issue #85.
    root.querySelectorAll('iframe[src], embed[src], object[data]')
      .forEach(el => push(el.src || el.data));
    root.querySelectorAll('*').forEach(el => {
      if (el.shadowRoot) visit(el.shadowRoot);
    });
  };

  visit(document);

  return links.length ? links : null;
};
