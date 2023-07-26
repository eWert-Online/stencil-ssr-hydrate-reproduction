import { Component, h, Prop, Host, State } from "@stencil/core";

/**
 * @slot *default* - The description (rich text) to display below the headline
 * @slot image - The <app-image> for this slide
 */
@Component({
  tag: "app-teaser-slider-slide",
  styleUrl: "teaser-slider-slide.scss",
  shadow: true,
})
export class AppTeaserSliderSlide {
  /**
   * The headline of the slide
   */
  @Prop() public headline: string;

  /**
   * The (optional) subheadline of the slide
   */
  @Prop() public subheadline: string;

  /**
   * The text of the standalone link
   */
  @Prop() public linkText?: string;

  /**
   * The link of the slide (on image and headline)
   */
  @Prop() public href?: string;

  /**
   * The target of the link.
   * If this is '_blank', rel="noopener noreferrer" is added automatically.
   */
  @Prop() public target: "_top" | "_parent" | "_blank" | "_self" = "_self";

  /**
   * true of the elements links (headline, image or textlink) are hovered
   */
  @State() public hovered: boolean = false;

  private setHovered = () => {
    this.hovered = true;
  };

  private unsetHovered = () => {
    this.hovered = false;
  };

  render() {
    const content = [
      <div class='TeaserSliderSlide-image'>
        <slot name='image' />
      </div>,
      <div class='TeaserSliderSlide-content'>
        <h4 class='TeaserSliderSlide-headline'>
          {this.headline}
          {this.subheadline && <span class='TeaserSliderSlide-subheadline'>{this.subheadline}</span>}
        </h4>
        <app-copytext class='TeaserSliderSlide-text'>
          <slot />
        </app-copytext>
        {this.linkText && this.href ? (
          <app-link-primary
            class='TeaserSliderSlide-link'
            iconSize='S'
            iconRight='arrow-right'
            text={this.linkText}
            onMouseOver={this.setHovered}
            onMouseOut={this.unsetHovered}
            imitateLink={true}
          ></app-link-primary>
        ) : null}
      </div>,
    ];

    return (
      <Host
        class={`
                    TeaserSliderSlide
                    ${this.href ? "TeaserSliderSlide--linked" : ""}
                    ${this.hovered ? "TeaserSliderSlide--hovered" : ""}
                    swiper-slide
                `}
      >
        {this.href ? (
          <a
            class='TeaserSliderSlide-container'
            href={this.href}
            target={this.target}
            rel={this.target === "_blank" ? "noopener noreferrer" : null}
            onMouseOver={this.setHovered}
            onMouseOut={this.unsetHovered}
          >
            {content}
          </a>
        ) : (
          <div class='TeaserSliderSlide-container'>{content}</div>
        )}
      </Host>
    );
  }
}
