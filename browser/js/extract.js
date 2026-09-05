'use strict';

/**
 * Extract links from the current document.
 *
 * Runs in the page context via chrome.scripting.executeScript, so it must
 * not reference any variables from the extension scope. It is defined here
 * as a plain global (loaded via a <script> tag) so it can also be unit
 * tested in isolation under jsdom.
 *
 * In addition to the light DOM, this recurses into open shadow roots so
 * that links rendered by web components (e.g. archive.org's lit-based
 * <app-root>) are collected. document.links and querySelectorAll do not
 * pierce shadow boundaries, so without this recursion such pages report
 * zero links and the results tab hangs. See issue #83.
 *
 * @function extractLinksInPage
 * @param {Document|ShadowRoot} [root=document] -- root to walk.
 * @return {string[]|null}
 */
function extractLinksInPage(root) {
  if (!root) root = document;
  const links = [];
  const push = url => {
    if (!url) return;
    try {
      links.push(decodeURI(url));
    } catch (e) {
      links.push(url);
    }
  };

  // Recursively visit a root (Document or ShadowRoot), collecting links
  // and descending into nested open shadow roots.
  const visit = node => {
    // document.links covers only <a> and <area>; querySelectorAll with an
    // explicit [href] selector is equivalent and works inside shadow roots.
    node.querySelectorAll('a[href], area[href]').forEach(el => push(el.href));
    // Collect embedded resources that document.links misses. Without this,
    // pages that embed videos via <iframe src=".../embed/..."> (e.g. YouTube
    // embeds on article pages) report far fewer links than present. See #85.
    node.querySelectorAll('iframe[src], embed[src], object[data]')
      .forEach(el => push(el.src || el.data));
    // Descend into open shadow roots. Closed shadow roots are not accessible.
    node.querySelectorAll('*').forEach(el => {
      if (el.shadowRoot) visit(el.shadowRoot);
    });
  };

  visit(root);
  return links.length ? links : null;
}

// Export for unit tests under Node/jsdom. In the extension page context
// (plain <script> tag) `module` is undefined, so this is a no-op there.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {extractLinksInPage};
}
