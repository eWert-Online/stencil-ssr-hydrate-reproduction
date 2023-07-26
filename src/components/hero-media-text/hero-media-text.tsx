import { Component, h, Prop, Host, Element, State } from "@stencil/core";
import ResizeObserver from "resize-observer-polyfill";

@Component({
  tag: "app-hero-media-text",
  styleUrl: "hero-media-text.scss",
  shadow: true,
})
export class AppHeroMediaText {
  @Element() private el: HTMLAppHeroMediaTextElement;

  /**
   * The background color of the media text module
   */
  @Prop() public backgroundColor?: "light" | "dark" = "light";

  /**
   * The alignment of the image inside of the hero-media-text module
   */
  @Prop() public imageAlignment?: "left" | "right" = "left";

  /**
   * XSmall source of the background image
   */
  @Prop() public backgroundImageXsmall?: string;

  /**
   * Small source of the background image
   */
  @Prop() public backgroundImageSmall?: string;

  /**
   * Medium source of the background image
   */
  @Prop() public backgroundImageMedium?: string;

  /**
   * Large source of the background image
   */
  @Prop() public backgroundImageLarge?: string;

  /**
   * XLarge source of the background image
   */
  @Prop() public backgroundImageXlarge?: string;

  /**
   * The alt text of the image
   */
  @Prop() public imageAlt: string;

  /**
   * XSmall source of the image
   */
  @Prop() public imageXsmall?: string;

  /**
   * Small source of the image
   */
  @Prop() public imageSmall?: string;

  /**
   * Medium source of the image
   */
  @Prop() public imageMedium?: string;

  /**
   * Large source of the image
   */
  @Prop() public imageLarge?: string;

  /**
   * XLarge source of the image
   */
  @Prop() public imageXlarge?: string;

  /**
   * If the image should have a padding to the sides of the container
   */
  @State() shouldHaveImagePadding: boolean = false;

  private observer: ResizeObserver;

  private setShouldHaveImagePadding = () => {
    const contentHeight = this.el.shadowRoot.querySelector(".HeroMediaText-content").clientHeight;
    const imageHeight = this.el.shadowRoot.querySelector(".HeroMediaText-image").clientHeight;

    if (imageHeight >= contentHeight) {
      this.shouldHaveImagePadding = false;
    } else {
      this.shouldHaveImagePadding = true;
    }
  };

  connectedCallback() {
    this.observer = new ResizeObserver(() => {
      this.setShouldHaveImagePadding();
    });
    this.observer.observe(this.el);
  }

  componentDidLoad() {
    if (this.backgroundColor === "dark") {
      this.el.querySelectorAll("app-copytext").forEach((copytext: HTMLAppCopytextElement) => {
        copytext.inverted = true;
      });
    } else {
      this.el.querySelectorAll("app-copytext").forEach((copytext: HTMLAppCopytextElement) => {
        copytext.inverted = false;
      });
    }
  }

  disconnectedCallback() {
    this.observer.unobserve(this.el);
  }

  render() {
    return (
      <Host
        class={`
                    HeroMediaText
                    HeroMediaText--${this.backgroundColor}
                    HeroMediaText--${this.imageAlignment}
                    ${this.shouldHaveImagePadding ? "HeroMediaText--imagePadding" : ""}
                `}
      >
        <div class='HeroMediaText-intro'>
          <slot name='intro' />
        </div>
        <div class='HeroMediaText-wrapper'>
          <app-image
            class='HeroMediaText-background'
            background={true}
            alt=''
            xsmall={this.backgroundImageXsmall}
            small={this.backgroundImageSmall}
            medium={this.backgroundImageMedium}
            large={this.backgroundImageLarge}
            xlarge={this.backgroundImageXlarge}
          />
          <div class='HeroMediaText-container'>
            <app-image
              class='HeroMediaText-image'
              alt={this.imageAlt}
              xsmall={this.imageXsmall}
              small={this.imageSmall}
              medium={this.imageMedium}
              large={this.imageLarge}
              xlarge={this.imageXlarge}
            />
            <app-text-content class='HeroMediaText-content'>
              <slot />
            </app-text-content>
          </div>
        </div>
      </Host>
    );
  }
}
