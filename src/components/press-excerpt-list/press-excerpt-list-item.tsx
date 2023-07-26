import { Component, h, Prop, State, Host, Element } from "@stencil/core";

/**
 * @slot *default* - The description (rich text) and optional primary-link to display below the headline
 * @slot image - The <app-image> for this teaser
 */
@Component({
  tag: "app-press-excerpt-list-item",
  styleUrl: "press-excerpt-list-item.scss",
  shadow: true,
})
export class AppPressExcerptListItem {
  @Element() el: HTMLAppPressExcerptListItemElement;

  /**
   * The date of the press excerpt
   */
  @Prop() public date: string;

  /**
   * The headline of the press excerpt
   */
  @Prop() public headline: string;

  /**
   * The (optional) subheadline of the press excerpt
   */
  @Prop() public subheadline: string;

  /**
   * The text of the standalone link
   */
  @Prop() public linkText?: string;

  /**
   * The link of the press excerpt
   */
  @Prop() public href?: string;

  /**
   * The target of the link.
   * If this is '_blank', rel="noopener noreferrer" is added automatically.
   */
  @Prop() public target: "_top" | "_parent" | "_blank" | "_self" = "_self";

  /**
   * true of the element is hovered
   */
  @State() public hovered: boolean = false;

  private setHovered = () => {
    this.hovered = true;
  };

  private unsetHovered = () => {
    this.hovered = false;
  };

  componentDidRender() {
    const slotEl = this.el.shadowRoot.querySelector("#slottedContent slot") as HTMLSlotElement;
    const innerHTML = slotEl
      .assignedNodes({ flatten: true })
      .map((node) => {
        if (node.nodeName === "#text") {
          return node.textContent;
        } else {
          return (node as HTMLElement).innerHTML;
        }
      })
      .join("")
      .trim()
      .replace(/<\/?strong>/g, "")
      .replace(/<\/?b>/g, "");

    if (innerHTML) {
      const textEl = this.el.shadowRoot.querySelector(".PressExcerptListItem-text") as HTMLDivElement;
      textEl.innerHTML = innerHTML;
    }
  }

  render() {
    return (
      <Host
        class={`
                    PressExcerptListItem
                    ${this.hovered ? "PressExcerptListItem--hovered" : ""}
                `}
        onMouseOver={this.setHovered}
        onMouseOut={this.unsetHovered}
      >
        <a
          class='PressExcerptListItem-container'
          href={this.href}
          target={this.target}
          rel={this.target === "_blank" ? "noopener noreferrer" : null}
        >
          <div class='PressExcerptListItem-image'>
            <slot name='image' />
          </div>
          <div class='PressExcerptListItem-content'>
            <aside class='PressExcerptListItem-date'>{this.date}</aside>
            <h5 class='PressExcerptListItem-headline'>
              {this.headline}
              {this.subheadline && <span class='PressExcerptListItem-subheadline'>{this.subheadline}</span>}
            </h5>
            <div class='PressExcerptListItem-text'></div>
          </div>
        </a>
        <div id='slottedContent' style={{ display: "none" }}>
          <slot />
        </div>
      </Host>
    );
  }
}
