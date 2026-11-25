/** Smallest font size (px) the recipient name may shrink to before it is allowed to overflow. */
export const NAME_MIN_FONT_SIZE = 18;

/**
 * Inline script embedded in the exported template: keeps the recipient name on a single line by
 * shrinking its font size until it fits the element's width. The backend renderer (headless
 * Chromium) runs it after the web fonts load, so long names such as "Iuliana-Loredana Cozloschi"
 * no longer wrap — a wrap would push the centred name over the kicker and its underline onto the
 * body copy. The authored size is kept in `data-max-size` so a re-run (fonts finishing late)
 * always starts from the design's size instead of an already-shrunk one.
 */
export const FIT_NAME_SCRIPT = `
(function () {
  var MIN_SIZE = ${String(NAME_MIN_FONT_SIZE)};
  function fit() {
    var el = document.querySelector('[data-element="name"]');
    if (!el) { return; }
    if (!el.getAttribute('data-max-size')) {
      el.setAttribute('data-max-size', String(parseFloat(getComputedStyle(el).fontSize)));
    }
    var size = parseFloat(el.getAttribute('data-max-size'));
    el.style.fontSize = size + 'px';
    while (el.scrollWidth > el.clientWidth && size > MIN_SIZE) {
      size -= 1;
      el.style.fontSize = size + 'px';
    }
  }
  fit();
  if (document.fonts) {
    if (document.fonts.ready) { document.fonts.ready.then(fit); }
    if (document.fonts.addEventListener) { document.fonts.addEventListener('loadingdone', fit); }
  }
})();
`;
