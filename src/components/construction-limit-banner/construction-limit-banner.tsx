import { Component, h, Host, Element, State } from "@stencil/core";
import ResizeObserver from "resize-observer-polyfill";

import breakpoints from "../../utils/breakpoints";

@Component({
  tag: "app-construction-limit-banner",
  styleUrl: "construction-limit-banner.scss",
  shadow: true,
})
export class AppConstructionLimitBanner {
  @Element() private el: HTMLAppConstructionLimitBannerElement;

  @State() private mediaOffset: number = 0;

  private observer: ResizeObserver;

  private handleResize = () => {
    const rect = this.el.shadowRoot.querySelector(".ConstructionLimitBanner-media").getBoundingClientRect();
    if (window.innerWidth >= breakpoints.medium) {
      this.mediaOffset = 0;
    } else {
      this.mediaOffset = rect.height / 2;
    }
  };

  connectedCallback() {
    this.observer = new ResizeObserver(() => {
      this.handleResize();
    });
    this.observer.observe(this.el);
  }

  componentDidLoad() {
    this.handleResize();
  }

  disconnectedCallback() {
    this.observer.unobserve(this.el);
  }

  render() {
    return (
      <Host
        class={`
                    ConstructionLimitBanner
                `}
      >
        <div class='ConstructionLimitBanner-intro'>
          <slot name='intro' />
        </div>
        <div class='ConstructionLimitBanner-wrapper'>
          <div class='ConstructionLimitBanner-container' style={{ marginTop: `${this.mediaOffset}px` }}>
            <div class='ConstructionLimitBanner-media' style={{ marginTop: `${this.mediaOffset * -1}px` }}>
              <slot name='media' />
            </div>
            <div class='ConstructionLimitBanner-content'>
              <slot />
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
