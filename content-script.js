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
  var doc_links;

  const sel = document.getSelection();

  switch(sel.type) {
    case 'Range':
      doc_links = Array.from(document.links).filter(link => sel.containsNode(link, true));
      break;
    default:
      doc_links = document.links;
  }

  for (let index = 0; index < doc_links.length; index++) {
    links.push({'href': decodeURI(doc_links[index].href),
                'text': doc_links[index].textContent
               });
  }

  return links.length ? links : null;
};
