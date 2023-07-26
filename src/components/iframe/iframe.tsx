import { Component, h, Host, Prop, Element, State } from "@stencil/core";
import ResizeObserver from "resize-observer-polyfill";

import breakpoints from "../../utils/breakpoints";

/**
 * @slot intro - The module-intro to display above this module (optional)
 */
@Component({
  tag: "app-iframe",
  styleUrl: "iframe.scss",
  shadow: true,
})
export class AppIframe {
  @Element() el: HTMLAppIframeElement;

  /**
   * If the iframe should be the full width of the viewport
   */
  @Prop() public breakout: boolean = false;

  /**
   * The src url to display inside the iframe
   */
  @Prop() public src: string;

  /**
   * The height of the iframe in the XL breakpoint
   */
  @Prop() public height: number = 0;

  @State() private calculatedHeight: number = this.height;

  private observer: ResizeObserver;

  private setHeight = () => {
    const width = window.innerWidth;

    if (width >= breakpoints.xlarge) {
      this.calculatedHeight = this.height;
    } else if (width >= breakpoints.large) {
      this.calculatedHeight = this.height;
    } else if (width >= breakpoints.medium) {
      this.calculatedHeight = this.height * 0.8;
    } else if (width >= breakpoints.websiteSmall) {
      this.calculatedHeight = this.height * 0.6;
    } else {
      this.calculatedHeight = this.height * 0.5;
    }
  };

  componentDidLoad() {
    this.observer = new ResizeObserver(this.setHeight);
    this.observer.observe(this.el);
    this.setHeight();
  }

  disconnectedCallback() {
    this.observer.disconnect();
  }

  render() {
    const iframe = <iframe class='Iframe-frame' src={this.src} height={this.calculatedHeight} frameborder='0'></iframe>;
    return (
      <Host
        class={`
                    Iframe
                `}
      >
        <div class='Iframe-intro'>
          <slot name='intro' />
        </div>
        {this.breakout ? iframe : <div class='Iframe-container'>{iframe}</div>}
      </Host>
    );
  }
}
