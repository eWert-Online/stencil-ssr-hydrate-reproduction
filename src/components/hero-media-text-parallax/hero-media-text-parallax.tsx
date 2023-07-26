import { Component, h, Prop, State, Host, Element } from "@stencil/core";
import ResizeObserver from "resize-observer-polyfill";
import Parallax from "../../utils/parallax";
import breakpoints from "../../utils/breakpoints";

@Component({
  tag: "app-hero-media-text-parallax",
  styleUrl: "hero-media-text-parallax.scss",
  shadow: true,
})
export class AppHeroMediaTextParallax {
  @Element() private el: HTMLAppHeroMediaTextParallaxElement;

  /**
   * The side on which the content should be displayed
   */
  @Prop() public alignContent?: "left" | "right" = "left";

  /**
   * The background color of the media text module
   */
  @Prop() public backgroundColor?: "light" | "dark" = "light";

  @State() containerHeight = 0;

  @State() imageHeight = 0;

  private parallax: Parallax;

  private observer: ResizeObserver;

  private setHeight = () => {
    this.containerHeight = this.el.shadowRoot.querySelector(".HeroMediaTextParallax-wrapper").clientHeight;
    this.imageHeight = this.el.shadowRoot.querySelector(".HeroMediaTextParallax-parallax").clientHeight;
  };

  connectedCallback() {
    this.observer = new ResizeObserver(() => {
      this.setHeight();
    });
  }

  componentDidLoad() {
    this.observer.observe(this.el.shadowRoot.querySelector(".HeroMediaTextParallax-wrapper"));
    this.observer.observe(this.el.shadowRoot.querySelector(".HeroMediaTextParallax-parallax"));

    const parallaxContainer = this.el.shadowRoot.querySelector(".HeroMediaTextParallax-parallax");

    if (this.backgroundColor === "dark") {
      this.el.querySelectorAll("app-copytext").forEach((copytext: HTMLAppCopytextElement) => {
        copytext.inverted = true;
      });
    } else {
      this.el.querySelectorAll("app-copytext").forEach((copytext: HTMLAppCopytextElement) => {
        copytext.inverted = false;
      });
    }

    this.parallax = new Parallax(parallaxContainer, {
      speed: -1,
      round: true,
      wrapper: this.el as HTMLElement,
    });
  }

  componentDidUpdate() {
    this.parallax.refresh();
  }

  disconnectedCallback() {
    this.parallax.destroy();
    this.observer.unobserve(this.el.shadowRoot.querySelector(".HeroMediaTextParallax-wrapper"));
    this.observer.unobserve(this.el.shadowRoot.querySelector(".HeroMediaTextParallax-parallax"));
  }

  render() {
    let minScroll = -50;
    let moduleSpacingTop = 0;

    if (window.innerWidth >= breakpoints.medium) {
      moduleSpacingTop = 50;
    }
    if (this.containerHeight > this.imageHeight) {
      minScroll = (this.containerHeight - this.imageHeight) * -1 - 50;
    } else {
      moduleSpacingTop += this.imageHeight - this.containerHeight;
    }

    return (
      <Host
        class={`
                    HeroMediaTextParallax
                    HeroMediaTextParallax--${this.backgroundColor.toLowerCase()}
                    HeroMediaTextParallax--${this.alignContent.toLowerCase()}
                `}
      >
        <div class='HeroMediaTextParallax-intro'>
          <slot name='intro' />
        </div>
        <div class='HeroMediaTextParallax-wrapper' style={{ marginTop: `${moduleSpacingTop}px` }}>
          <div class='HeroMediaTextParallax-background'>
            <slot name='background' />
          </div>
          <div class='HeroMediaTextParallax-container'>
            <div class='HeroMediaTextParallax-media'>
              <div
                class='HeroMediaTextParallax-parallax'
                data-parallax-percentage='0.5'
                data-parallax-min={minScroll}
                data-parallax-max='0'
              >
                <slot name='media' />
              </div>
            </div>
            <app-text-content class='HeroMediaTextParallax-content'>
              <slot />
            </app-text-content>
          </div>
        </div>
      </Host>
    );
  }
}
