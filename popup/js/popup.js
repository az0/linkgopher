'use strict';

import { handler, openTab } from './functions.js';

document.getElementById('extract-all').addEventListener('click', event => {
  handler(false).then(() => window.close());
});

document.getElementById('extract-some').addEventListener('click', event => {
  handler(true).then(() => window.close());
});

document.getElementById('about-linkgopher').addEventListener('click', event => {
  const {homepage_url} = chrome.runtime.getManifest();
  openTab(homepage_url).then(() => window.close());
});

// Localization.
[
  {id: 'extract-all', messageId: 'extractAll'},
  {id: 'extract-some', messageId: 'extractSome'},
  {id: 'about-linkgopher', messageId: 'aboutLinkGopher'}
].forEach(item => {
  const container = document.getElementById(item.id);
  container.innerText = chrome.i18n.getMessage(item.messageId);
})
