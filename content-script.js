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

  for (let index = 0; index < document.links.length; index++) {
    links.push(decodeURI(document.links[index].href));
  }

  return links.length ? links : null;
};
