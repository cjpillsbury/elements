import { globalThis } from 'shared-polyfills';

const Attributes = {
  TOKEN: 'token',
  POLL_INTERVAL: 'pollinterval',
};

const DEFAULT_POLL_INTERVAL = 20;

const AttributeValues = Object.freeze(Object.values(Attributes));

export const subscribeViewerCount = (
  token: string,
  pollInterval: number,
  callback: (views: number) => void,
  errorCb: (errorMsg: string) => void
) => {
  const url = `https://stats.mux.com/counts?token=${token}`;
  const controller = new AbortController();
  const signal = controller.signal;
  let timeoutId: number | undefined;
  let aborted = false;
  const fetchViewerCountPoll: () => Promise<any> = async () => {
    // If the polling has been aborted (via an "unsubscribe()"),
    // we can simply bail on the recursion.
    if (aborted) return Promise.resolve();
    // GET the latest view count, providing an abort signal
    // for unsubscription.
    return (
      fetch(url, { signal })
        // Grab the JSON value of the response
        .then((resp) => resp.json())
        // Confirm that response wasn't an error and the JSON
        // has the expected data
        .then((respObj) => {
          const views = respObj?.data?.[0]?.views;
          if (!!respObj?.error || views == null) {
            // If not, treat as an error.
            return Promise.reject(respObj?.error ?? 'no data in response');
          }
          // Otherwise, we successfully retrieved the latest views, so
          // provide that info out via `callback()`.
          callback(views);
          return views;
        })
        // Catch and invoke errorCb before timeout + re-fetch. This allows
        // for re-fetching by default, but provides the opportunity
        // to unsubscribe externally via `errorCb` if desired (CJP)
        .catch(errorCb)
        // Wait the duration of the polling interval before restarting
        // the next fetch
        .then(() => {
          return new Promise((resolve) => {
            timeoutId = setTimeout(async () => {
              resolve(undefined);
            }, pollInterval * 1000);
          });
        })
        // Restart process of re-fetching by invoking this method again
        // (async recursion)
        .then(fetchViewerCountPoll)
    );
  };

  // Kick off the polling functionality.
  fetchViewerCountPoll();

  // Return an "unsubscribe()" function. Invoking this will abort
  // any mid-flight fetches, clear any pending timeouts for
  // a re-fetch, and mark this process as "aborted".
  return () => {
    aborted = true;
    controller.abort();
    if (typeof timeoutId === 'number') {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };
};

class MuxViewerCountElement extends globalThis.HTMLElement {
  static get observedAttributes() {
    return AttributeValues;
  }

  #unsubscribeViewerCount: (() => void) | undefined;

  constructor() {
    super();
  }

  get token() {
    return this.getAttribute(Attributes.TOKEN) ?? '';
  }

  set token(value: string) {
    if (this.token === value) return;
    this.setAttribute(Attributes.TOKEN, value);
  }

  get pollInterval() {
    return this.hasAttribute(Attributes.POLL_INTERVAL)
      ? +(this.getAttribute(Attributes.POLL_INTERVAL) as string)
      : DEFAULT_POLL_INTERVAL;
  }

  set pollInterval(value: number) {
    if (this.pollInterval === value) return;
    this.setAttribute(Attributes.POLL_INTERVAL, `${value}`);
  }

  connectedCallback() {
    this.#setupViewerCountPolling();
  }

  disconnectedCallback() {
    this.#teardownViewerCountPolling();
  }

  attributeChangedCallback(attrName: string, oldValue: string | null, newValue: string | null) {
    /** @TODO Support dynamic (re)setting of attributes (CJP) */
  }

  #setupViewerCountPolling() {
    if (this.token && this.pollInterval && !this.#unsubscribeViewerCount) {
      this.#unsubscribeViewerCount = subscribeViewerCount(
        this.token,
        this.pollInterval,
        // Success callback
        (views) => {
          this.dispatchEvent(
            new CustomEvent('change', {
            detail: views,
            })
          );
          /** @TODO Add views getter (JKS) */
          /** @TODO Add "beefier" template (CJP) */
          this.textContent = `${views}`;
        },
        // Error callback
        (errorMsg) => {
          this.dispatchEvent(
            new CustomEvent('error', {
            detail: errorMsg,
            })
          );
          /** @TODO Consider adding retry count/logic (CJP) */
          console.warn('Failed to retrieve viewer count: Error - ', errorMsg);
          this.#teardownViewerCountPolling();
        }
      );
    }
  }

  #teardownViewerCountPolling() {
    this.#unsubscribeViewerCount?.();
    this.#unsubscribeViewerCount = undefined;
  }
}

if (!globalThis.customElements.get('media-viewer-count')) {
  globalThis.customElements.define('media-viewer-count', MuxViewerCountElement);
}

export default MuxViewerCountElement;