import { Component, h, Prop, Host, State } from "@stencil/core";

@Component({
  tag: "app-banner",
  styleUrl: "banner.scss",
  shadow: true,
})
export class AppBanner {
  /**
   * The alignment of the image
   */
  @Prop() public imageAlignment?: "left" | "right" = "left";

  /**
   * The level to use for the headline.
   * Defaults to "h2"
   */
  @Prop() public headlineTag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" = "h2";

  /**
   * The default (black) text for the headline
   */
  @Prop() public headlineText?: string;

  /**
   * The text displayed inside the button
   */
  @Prop() public linkText: string;

  /**
   * The name of the icon on the left side of the text.
   */
  @Prop() public linkIconLeft?: string;

  /**
   * The name of the icon on the right side of the text.
   */
  @Prop() public linkIconRight?: string;

  /**
   * `true` if the button should be disabled
   */
  @Prop() public linkDisabled?: boolean = false;

  /**
   * The url where the button-link should direct to
   */
  @Prop() public linkHref?: string;

  /**
   * The target of the button-link.
   * If this is '_blank', rel="noopener noreferrer" is added automatically.
   */
  @Prop() public linkTarget?: "_top" | "_parent" | "_blank" | "_self" = "_self";

  @State() hovered: boolean = false;

  private handleMouseOver = () => {
    this.hovered = true;
  };

  private handleMouseOut = () => {
    this.hovered = false;
  };

  render() {
    return (
      <Host
        class={`
            Banner
            Banner--${this.imageAlignment.toLowerCase()}
        `}
      >
        <div class='Banner-wrapper'>
          <a
            class='Banner-container'
            href={this.linkHref}
            target={this.linkDisabled ? null : this.linkTarget}
            rel={this.linkTarget === "_blank" ? "noopener noreferrer" : null}
            onMouseOver={this.handleMouseOver}
            onMouseOut={this.handleMouseOut}
          >
            <div class='Banner-image'>
              <slot name='image' />
            </div>
            <div class='Banner-content'>
              <this.headlineTag class='Banner-headline'>{this.headlineText}</this.headlineTag>
              <slot />
              <app-button-secondary
                class={this.hovered ? "is-hovered" : ""}
                text={this.linkText}
                disabled={this.linkDisabled}
                icon-left={this.linkIconLeft}
                icon-right={this.linkIconRight}
                imitateButton={true}
              ></app-button-secondary>
            </div>
          </a>
        </div>
      </Host>
    );
  }
}
