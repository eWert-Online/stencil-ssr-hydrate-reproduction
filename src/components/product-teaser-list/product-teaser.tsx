import { Component, h, Prop, State, Host } from "@stencil/core";

/**
 * @slot *default* - The description (rich text) to display in this teaser
 * @slot image - The <app-image> for this teaser
 */
@Component({
  tag: "app-product-teaser",
  styleUrl: "product-teaser.scss",
  shadow: true,
})
export class AppProductTeaser {
  /**
   * The headline of the teaser
   */
  @Prop() public headline: string;

  /**
   * The subheadline of the teaser
   */
  @Prop() public subheadline: string;

  /**
   * The text of the button
   */
  @Prop() public linkText?: string;

  /**
   * The link of the teaser (on image and headline)
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
      <div key='image' class='ProductTeaser-image'>
        <slot name='image' />
      </div>,
      <div key='content' class='ProductTeaser-content'>
        <h5 class='ProductTeaser-headline'>{this.headline}</h5>
        {this.subheadline ? <h6 class='ProductTeaser-subheadline'>{this.subheadline}</h6> : null}
        <app-copytext size='S' class='ProductTeaser-text'>
          <slot />
        </app-copytext>
        {this.linkText && this.href ? (
          <app-button-secondary
            class='ProductTeaser-button'
            text={this.linkText}
            href={this.href}
            target={this.target}
            onMouseOver={this.setHovered}
            onMouseOut={this.unsetHovered}
            imitateButton={true}
          />
        ) : null}
      </div>,
    ];

    return (
      <Host
        class={`
                    ProductTeaser
                    ${this.href ? "ProductTeaser--linked" : ""}
                    ${this.hovered ? "ProductTeaser--hovered" : ""}
                `}
      >
        {this.href ? (
          <a
            class='ProductTeaser-container'
            href={this.href}
            target={this.target}
            rel={this.target === "_blank" ? "noopener noreferrer" : null}
            onMouseOver={this.setHovered}
            onMouseOut={this.unsetHovered}
          >
            {content}
          </a>
        ) : (
          <div class='ProductTeaser-container'>{content}</div>
        )}
      </Host>
    );
  }
}
