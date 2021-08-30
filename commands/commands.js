// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands

import { handler } from '../popup/js/functions.js';


if (typeof browser !== 'undefined') {
    browser.commands.onCommand.addListener(function (command) {
        if (command === "extract-all") {
          handler(false);
        }

        if (command === "extract-some") {
          handler(true);
        }
      });
}
