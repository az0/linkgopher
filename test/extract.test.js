'use strict';

const {extractLinksInPage} = require('../browser/js/extract.js');

// Build a fresh document body for each test. jsdom resolves relative hrefs
// against "about:blank", so use absolute URLs in fixtures.
function resetDoc() {
  document.body.innerHTML = '';
}

describe('extractLinksInPage', () => {
  beforeEach(resetDoc);

  it('collects plain light-DOM <a> links', () => {
    document.body.innerHTML = `
      <a href="https://example.com/a">a</a>
      <a href="https://example.com/b">b</a>
    `;
    const links = extractLinksInPage();
    expect(links).toEqual([
      'https://example.com/a',
      'https://example.com/b',
    ]);
  });

  it('returns null when the document has no links (issue #83 hang regression)', () => {
    document.body.innerHTML = `<p>no links here</p>`;
    expect(extractLinksInPage()).toBeNull();
  });

  it('collects links rendered inside open shadow roots (issue #83)', () => {
    // Mimics archive.org: <body> contains only <app-root>, whose real
    // links live in shadow DOM. document.links would see zero links.
    document.body.innerHTML = `<app-root></app-root>`;
    const host = document.querySelector('app-root');
    const shadow = host.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <nav>
        <a href="https://archive.org/details/foo">foo</a>
        <a href="https://archive.org/details/bar">bar</a>
      </nav>
    `;

    const links = extractLinksInPage();
    expect(links).toEqual([
      'https://archive.org/details/foo',
      'https://archive.org/details/bar',
    ]);
  });

  it('recurses into nested open shadow roots', () => {
    document.body.innerHTML = `<x-outer></x-outer>`;
    const outer = document.querySelector('x-outer');
    const outerShadow = outer.attachShadow({mode: 'open'});
    outerShadow.innerHTML = `<a href="https://outer.test/">outer</a><x-inner></x-inner>`;
    const inner = outerShadow.querySelector('x-inner');
    const innerShadow = inner.attachShadow({mode: 'open'});
    innerShadow.innerHTML = `<a href="https://inner.test/">inner</a>`;

    const links = extractLinksInPage();
    expect(links).toEqual([
      'https://outer.test/',
      'https://inner.test/',
    ]);
  });

  it('does not hang or throw on closed shadow roots (just skips them)', () => {
    document.body.innerHTML = `<x-closed></x-closed><a href="https://light.test/">light</a>`;
    const host = document.querySelector('x-closed');
    const shadow = host.attachShadow({mode: 'closed'});
    shadow.innerHTML = `<a href="https://hidden.test/">hidden</a>`;

    // Must not throw and must not include the closed-root link.
    const links = extractLinksInPage();
    expect(links).toEqual(['https://light.test/']);
  });

  it('survives malformed percent-encoded URIs (issue #92 regression)', () => {
    document.body.innerHTML = `
      <a href="https://example.com/%">bad percent</a>
      <a href="https://example.com/%zz">bad hex</a>
      <a href="https://example.com/ok">ok</a>
    `;
    const links = extractLinksInPage();
    // decodeURI throws on lone "%" / non-hex "%zz"; the function must
    // fall back to the raw href rather than throwing.
    expect(links).toEqual([
      'https://example.com/%',
      'https://example.com/%zz',
      'https://example.com/ok',
    ]);
  });

  it('collects iframe/embed/object embedded sources (issue #85 regression)', () => {
    document.body.innerHTML = `
      <iframe src="https://youtube.com/embed/abc"></iframe>
      <embed src="https://example.com/embed.swf"></embed>
      <object data="https://example.com/movie.mp4"></object>
    `;
    const links = extractLinksInPage();
    expect(links).toEqual([
      'https://youtube.com/embed/abc',
      'https://example.com/embed.swf',
      'https://example.com/movie.mp4',
    ]);
  });

  it('skips <a> with no [href] attribute; empty href resolves to base URL', () => {
    document.body.innerHTML = `
      <a href="https://a.test/">a</a>
      <a>a without href</a>
      <a href="">empty href</a>
    `;
    const links = extractLinksInPage();
    // The hrefless <a> is not matched by [href]. The empty href resolves
    // to the document base URL (environment-dependent under jsdom), so only
    // assert the real link is present and that exactly two were collected.
    expect(links).toHaveLength(2);
    expect(links).toContain('https://a.test/');
    expect(links[1]).toBe(document.baseURI);
  });
});
