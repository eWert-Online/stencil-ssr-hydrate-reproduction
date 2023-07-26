import { Component, h, Prop, Host, State } from "@stencil/core";

/**
 * @slot *default* - The <app-image> for this list item
 * @slot text - The <app-copytext> to display below the caption (optional)
 */
@Component({
  tag: "app-image-list-item",
  styleUrl: "image-list-item.scss",
  shadow: true,
})
export class AppImageListItem {
  /**
   * The caption (optional) to display below the image
   */
  @Prop() public caption?: string;

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
   * The height of the highest image in a row.
   * This does not need to be set manually. It gets set by <app-image-list>
   */
  @Prop() public highestImage: number = 0;

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
    return (
      <Host
        class={`
                    ImageListItem
                    ${this.href ? "ImageListItem--linked" : ""}
                    ${this.hovered ? "ImageListItem--hovered" : ""}
                `}
      >
        {this.href ? (
          <a
            class='ImageListItem-wrapper'
            href={this.href}
            target={this.target}
            rel={this.target === "_blank" ? "noopener noreferrer" : null}
            onMouseOver={this.setHovered}
            onMouseOut={this.unsetHovered}
          >
            <figure class='ImageListItem-image' style={{ minHeight: `${this.highestImage}px` }}>
              <slot />
            </figure>
            {this.caption && <div class='ImageListItem-caption'>{this.caption}</div>}
            <div class='ImageListItem-text'>
              <slot name='text' />
            </div>
          </a>
        ) : (
          <div class='ImageListItem-wrapper'>
            <figure class='ImageListItem-image' style={{ minHeight: `${this.highestImage}px` }}>
              <slot />
            </figure>
            {this.caption && <div class='ImageListItem-caption'>{this.caption}</div>}
            <div class='ImageListItem-text'>
              <slot name='text' />
            </div>
          </div>
        )}
      </Host>
    );
  }
}
