import React from "react";
import { render } from "react-dom";
import MuxPlayer from "@mux-elements/mux-player-react";
import type MuxVideo from "@mux-elements/mux-video-react";

class MuxPlayerElement extends HTMLElement {
  static get observedAttributes() {
    return ["playback-id"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    // Initialize all the attribute properties
    Array.prototype.forEach.call(this.attributes, (attrNode) => {
      this.attributeChangedCallback(attrNode.name, undefined, attrNode.value);
    });

    if (this.video) (this.video as any).hls.config.maxMaxBufferLength = 2;
  }

  get video(): any {
    return this.shadowRoot?.querySelector("mux-video");
  }

  getVideoAttribute(name: string) {
    return this.video ? this.video.getAttribute(name) : this.getAttribute(name);
  }

  get playbackId(): any {
    return this.getVideoAttribute("playback-id");
  }

  attributeChangedCallback(
    attrName: string,
    oldValue?: string,
    newValue?: string
  ) {
    render(<MuxPlayer playbackId={this.playbackId} />, this.shadowRoot);
  }

  connectedCallback() {}
}

/** @TODO Refactor once using `globalThis` polyfills */
if (!globalThis.customElements.get("mux-player")) {
  globalThis.customElements.define("mux-player", MuxPlayerElement);
  /** @TODO consider externalizing this (breaks standard modularity) */
  // globalThis.MuxPlayerElement = MuxPlayerElement;
}

export default MuxPlayerElement;
