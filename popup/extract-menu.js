/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  console.error(`Failed to execute beastify content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs.executeScript({file: "/content_scripts/extract.js"})
.then(listenForClicks)
.catch(reportExecuteScriptError)
/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {


    /**
     * Insert the page-hiding CSS into the active tab,
     * then get the beast URL and
     * send a "beastify" message to the content script in the active tab.
     */
    function extractAll(tabs) {
        browser.tabs.sendMessage(tabs[0].id, {
          command: "extractAll",
      });
				window.close();
    }

    /**
		 * Extract links by filter
     */
    function extractByFilter(tabs) {
        browser.tabs.sendMessage(tabs[0].id, {
          command: "extractByFilter",
          filterText: document.getElementById("filterText").value
      });
				window.close();
    }

    /**
     * Just log the error to the console.
     */
    function reportError(error) {
      console.error(`Could not beastify: ${error}`);
    }

    /**
     * Get the active tab,
     * then call "beastify()" or "reset()" as appropriate.
     */
    if (e.target.classList.contains("extractAll")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(extractAll)
        .catch(reportError);
    }
    else if (e.target.classList.contains("extractFilter")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(extractByFilter)
        .catch(reportError);
    }
  });
}

