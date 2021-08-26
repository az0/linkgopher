// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands

import { handler } from '../popup/js/functions.js';

browser.commands.onCommand.addListener(function (command) {
    if (command === "extarct-all") {
      handler(false);
    }

    if (command === "extract-some") {
      handler(true);
    }
  });
