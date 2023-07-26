import { Component, h, Prop, Host } from "@stencil/core";

/**
 * @slot *default* - The description (rich text) and optional primary-link to display below the headline
 * @slot image - The <app-image> for this teaser
 */
@Component({
  tag: "app-icon-list-item",
  styleUrl: "icon-list-item.scss",
  shadow: true,
})
export class AppIconListItem {
  /**
   * The text of list item
   */
  @Prop() public text: string;

  /**
   * The link of the press excerpt
   */
  @Prop() public href?: string;

  /**
   * The target of the link.
   * If this is '_blank', rel="noopener noreferrer" is added automatically.
   */
  @Prop() public target: "_top" | "_parent" | "_blank" | "_self" = "_self";

  render() {
    return (
      <Host
        class={`
                    IconListItem
                    ${this.href ? "IconListItem--linked" : ""}
                `}
      >
        {this.href ? (
          <a
            class='IconListItem-container'
            href={this.href}
            target={this.target}
            rel={this.target === "_blank" ? "noopener noreferrer" : null}
          >
            <div class='IconListItem-image'>
              <slot name='image' />
            </div>
            <div class='IconListItem-content'>{this.text}</div>
          </a>
        ) : (
          <div class='IconListItem-container'>
            <div class='IconListItem-image'>
              <slot name='image' />
            </div>
            <div class='IconListItem-content'>{this.text}</div>
          </div>
        )}
      </Host>
    );
  }
}
