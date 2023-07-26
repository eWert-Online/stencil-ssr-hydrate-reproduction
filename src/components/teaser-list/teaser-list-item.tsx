import { Component, h, Prop, State, Host, Element } from "@stencil/core";

/**
 * @slot *default* - The description (rich text) and optional primary-link to display below the headline
 * @slot image - The <app-image> for this teaser
 */
@Component({
  tag: "app-teaser-list-item",
  styleUrl: "teaser-list-item.scss",
  shadow: true,
})
export class AppTeaserListItem {
  @Element() private el: HTMLAppTeaserListItemElement;

  /**
   * The headline of the teaser
   */
  @Prop() public headline: string;

  /**
   * The text of the standalone link
   */
  @Prop() public linkText?: string;

  /**
   * The text of the standalone button
   */
  @Prop() public buttonText?: string;

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

  private siblingTeasers: Array<HTMLAppTeaserListItemElement> = [];

  private setHovered = () => {
    this.hovered = true;
  };

  private unsetHovered = () => {
    this.hovered = false;
  };

  connectedCallback() {
    this.siblingTeasers = Array.from(this.el.parentElement.querySelectorAll("app-teaser-list-item"));
  }

  render() {
    const content = [
      <div class='TeaserListItem-image'>
        <slot name='image' />
      </div>,
      <div class='TeaserListItem-content'>
        <h5 class='TeaserListItem-headline'>{this.headline}</h5>
        <div class='TeaserListItem-text'>
          <slot />
        </div>
        {this.buttonText && this.href ? (
          <app-button-primary
            class='TeaserListItem-button'
            size='small'
            text={this.buttonText}
            href={this.href}
            target={this.target}
            onMouseOver={this.setHovered}
            onMouseOut={this.unsetHovered}
          />
        ) : null}
        {this.linkText && this.href ? (
          <app-link-primary
            class='TeaserListItem-link'
            iconSize='S'
            iconRight='arrow-right'
            text={this.linkText}
            href={this.href}
            target={this.target}
            onMouseOver={this.setHovered}
            onMouseOut={this.unsetHovered}
            imitateLink={true}
          />
        ) : null}
      </div>,
    ];

    return (
      <Host
        class={`
                    TeaserListItem
                    TeaserListItem--${this.siblingTeasers.length}
                    ${this.href ? "TeaserListItem--linked" : ""}
                    ${this.hovered ? "TeaserListItem--hovered" : ""}
                `}
      >
        {this.href ? (
          <a
            class='TeaserListItem-container'
            href={this.href}
            target={this.target}
            rel={this.target === "_blank" ? "noopener noreferrer" : null}
            onMouseOver={this.setHovered}
            onMouseOut={this.unsetHovered}
          >
            {content}
          </a>
        ) : (
          <div class='TeaserListItem-container'>{content}</div>
        )}
      </Host>
    );
  }
}
