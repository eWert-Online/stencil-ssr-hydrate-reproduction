import { Component, h, Prop, State, Host, Element } from "@stencil/core";

/**
 * @slot *default* - The description (rich text) and optional primary-link to display below the headline
 * @slot image - The <app-image> for this teaser
 * @slot share-bar - The <app-social-share-bar> for this teaser
 */
@Component({
  tag: "app-news-teaser",
  styleUrl: "news-teaser.scss",
  shadow: true,
})
export class AppNewsTeaser {
  @Element() el: HTMLAppNewsTeaserElement;

  /**
   * Convert the slotted rich text to plain text (remove all html tags)
   */
  @Prop() public plainText: boolean = false;

  /**
   * The date to display above the headline
   */
  @Prop() public date: string;

  /**
   * The headline of the teaser
   */
  @Prop() public headline: string;

  /**
   * The text of the standalone link
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

  componentDidLoad() {
    if (this.plainText === true) {
      const textEl = this.el.shadowRoot.querySelector(".NewsTeaser-text") as HTMLDivElement;
      const textContent = textEl
        .querySelector("slot")
        .assignedElements({ flatten: true })
        .map((node) => (node as HTMLElement).innerText)
        .join(" ")
        .trim();

      textEl.innerHTML = `<p>${textContent}</p>`;
    }
  }

  render() {
    const content = [
      <div class='NewsTeaser-image'>
        <slot name='image' />
      </div>,
      <div class='NewsTeaser-content'>
        <aside class='NewsTeaser-date'>{this.date}</aside>
        <h5 class='NewsTeaser-headline'>{this.headline}</h5>
        <div class='NewsTeaser-text'>
          <slot />
        </div>
        {this.linkText && this.href ? (
          <app-link-primary
            class='NewsTeaser-link'
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
                    NewsTeaser
                    ${this.href ? "NewsTeaser--linked" : ""}
                    ${this.hovered ? "NewsTeaser--hovered" : ""}
                `}
      >
        <div class='NewsTeaser-container'>
          {this.href ? (
            <a
              class='NewsTeaser-wrapper'
              href={this.href}
              target={this.target}
              rel={this.target === "_blank" ? "noopener noreferrer" : null}
              onMouseOver={this.setHovered}
              onMouseOut={this.unsetHovered}
            >
              {content}
            </a>
          ) : (
            <div class='NewsTeaser-wrapper'>{content}</div>
          )}
          <div class='NewsTeaser-socialBar'>
            <slot name='share-bar' />
          </div>
        </div>
      </Host>
    );
  }
}
