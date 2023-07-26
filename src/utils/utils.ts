import ResizeObserver from "resize-observer-polyfill";

export function observeDom(target: HTMLElement, callback: Function) {
  const config = { attributes: true, childList: true, characterData: true, subtree: true };
  const observer = new MutationObserver(() => {
    callback();
  });
  observer.observe(target, config);
}

export function observeSize(target: HTMLElement, callback: ResizeObserverCallback) {
  var observer = new ResizeObserver(callback);
  observer.observe(target);
}

/**
 * Sets up and renders ripple Material Design inspired Ripple effect
 */
export function activateRippleAnimation(event: MouseEvent, rippleType: "transparent" | "solid" = "transparent") {
  const trigger = event.currentTarget;
  if (trigger instanceof HTMLElement) {
    const circle = trigger.getElementsByClassName("ripple-circle")[0] as HTMLElement;
    const rippleContainer = trigger.getElementsByClassName("ripple-container")[0] as HTMLElement;
    const relativeDomRect = trigger.getBoundingClientRect();

    circle.style.left = `${event.clientX - relativeDomRect.left}px`;
    circle.style.top = `${event.clientY - relativeDomRect.top}px`;

    rippleContainer.classList.add(`is-${rippleType}-active`);
  }
}

/**
 * Cancels ripple Material Design inspired Ripple effect
 */
export function terminateRippleAnimation(event: AnimationEvent, rippleType: "transparent" | "solid" = "transparent") {
  const trigger = event.currentTarget;
  if (trigger instanceof HTMLElement) {
    trigger.classList.remove(`is-${rippleType}-active`);
  }
}

export function getTopLabelTextWidth(labelSpan: HTMLSpanElement, labelText: string, maxWidth: number) {
  var canvas = getTopLabelTextWidth["canvas"] || (getTopLabelTextWidth["canvas"] = document.createElement("canvas"));
  var context = canvas.getContext("2d");
  const computedStyle = window.getComputedStyle(labelSpan);
  const labelFontFamily = computedStyle.getPropertyValue("font-family");
  const labelFontStyle = computedStyle.getPropertyValue("font-style");
  context.font = `${labelFontStyle} 12px ${labelFontFamily}`;
  var metrics = context.measureText(labelText);
  if (maxWidth > 0 && metrics.width > maxWidth) {
    return maxWidth;
  }
  return metrics.width + 6;
}

export function getFilenameFromUrl(url: string) {
  return url.substring(url.lastIndexOf("/") + 1);
}

export async function downloadFile(downloadLink: string, downloadName: string) {
  return fetch(downloadLink, {
    method: "GET",
    mode: "cors",
  })
    .then((response) => response.blob())
    .then((blob) => {
      const imageUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = imageUrl;
      if (downloadName) {
        a.download = downloadName;
      }
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
}

/**
 * Inspired from this Gist https://gist.github.com/jakearchibald/0b50c4918eaf9a67bfcfa55e7e61cd56
 * see full Google Chrome Developers webinar here https://www.youtube.com/watch?v=9-6CKCz58A8
 * @param {HTMLElement} element
 * @param {Keyframe[] | PropertyIndexedKeyframes} to
 * @param {KeyframeAnimationOptions} options
 * @param {FillMode} fill defaults to "both"
 */
export function animateTo(
  element: HTMLElement,
  to: Keyframe[] | PropertyIndexedKeyframes,
  options: KeyframeAnimationOptions,
  fill: FillMode = "both",
): Promise<Animation> {
  const anim = element.animate(to, { ...options, fill });
  return anim.finished.then(() => {
    try {
      anim["commitStyles"]();
    } catch (e) {
      if (e instanceof DOMException && e.name === "InvalidStateError") {
        const platformTestLink =
          "https://github.com/web-platform-tests/wpt/blob/master/web-animations/interfaces/Animation/commitStyles.html";
        throw new Error(`Target ${element.nodeName}.${element.className} has not been rendered, probable causes are
              1. target is display: none
              2. target has ancestor with display: none
              Check the full reference here: ${platformTestLink}`);
      }
    }
    anim.cancel();
    return anim;
  });
}

/**
 * Returns promise which guarantees that element's inlines styles has
 * been applied and the changes were picked up by the render engine
 * @param {HTMLElement} element
 * @param {Keyframe[] | PropertyIndexedKeyframes} to
 * @param {boolean} nearInstant - animation timing correction,
 *  enforces a 20ms transition which technically not perceivable
 */
export function instantTransitionTo(
  element: HTMLElement,
  to: Keyframe[] | PropertyIndexedKeyframes,
  nearInstant = false,
): Promise<Animation> {
  return animateTo(element, to, { duration: nearInstant ? 20 : 0 });
}

/**
 * Terminates any animations affecting {@paramref elements} and return promise which guarantees all animations are finished.
 * @param {(HTMLElement)[]} elements
 */
export function finishAllAnimations(elements: HTMLElement[]): Promise<Animation[]> {
  const options = { subtree: true };
  const inEffectAnimations = elements
    .map((el) => {
      const lightDomAnimations = (el as any).getAnimations(options) as Animation[];
      const shadowDomAnimations = (el.shadowRoot as any).getAnimations() as Animation[];
      return lightDomAnimations.concat(shadowDomAnimations);
    })
    .reduce((acc, val) => acc.concat(val), []);

  inEffectAnimations.forEach((animation) => {
    animation?.finish();
  });
  return Promise.all(inEffectAnimations.map((animation) => animation?.finished));
}

/**
 * Whether the element is connected to the DOM and is it and all its ancestors are displayed (different display: 'none')
 * It works also works with both fixed and non-fixed positioned elements.
 * It returns true if element has visibility 'hidden'.
 * @param {HTMLElement} element
 */
export function isAttachedAndDisplayed(element: HTMLElement) {
  // reference: https://github.com/jquery/jquery/blob/master/src/css/hiddenVisibleSelectors.js
  return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}
