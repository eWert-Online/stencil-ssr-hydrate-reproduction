import { Component, h, Prop, Host, State, Element } from "@stencil/core";
import ResizeObserver from "resize-observer-polyfill";
import breakpoints from "../../utils/breakpoints";

/**
 * @slot *default* - The text to display inside of the overlay
 * @slot image - The <app-image> for this list item
 */
@Component({
  tag: "app-image-grid-item",
  styleUrl: "image-grid-item.scss",
  shadow: true,
})
export class AppImageGridItem {
  @Element() el: HTMLAppImageGridItemElement;

  /**
   * The headline of the item
   */
  @Prop() public headline: string;

  /**
   * The link of the item (on image, headline and optional textlink)
   */
  @Prop() public href?: string;

  /**
   * The target of the link.
   * If this is '_blank', rel="noopener noreferrer" is added automatically.
   */
  @Prop() public target: "_top" | "_parent" | "_blank" | "_self" = "_self";

  /**
   * The text of the standalone link
   */
  @Prop() public linkText?: string;

  /**
   * true of the element is hovered on touch devices
   */
  @Prop({ mutable: true }) public hovered: boolean = false;

  @State() public size: "small" | "medium" | "large" = "small";

  private observer: ResizeObserver;

  private handleTouch = (e: TouchEvent) => {
    this.el.parentElement.querySelectorAll("app-image-grid-item").forEach((item) => {
      if (item !== this.el) {
        item.hovered = false;
      }
    });
    if (!this.hovered) {
      e.preventDefault();
      this.hovered = true;
    } else {
      this.hovered = false;
    }
  };

  private setSize = () => {
    const windowWidth = window.innerWidth;
    const rect = this.el.getBoundingClientRect();

    if (windowWidth >= breakpoints.xlarge) {
      if (rect.height > 260) {
        this.size = "large";
      } else if (rect.width > 320) {
        this.size = "medium";
      }
    } else if (windowWidth >= breakpoints.large) {
      if (rect.height > 200) {
        this.size = "large";
      } else if (rect.width > 300) {
        this.size = "medium";
      }
    } else {
      this.size = "small";
    }
  };

  connectedCallback() {
    this.observer = new ResizeObserver(this.setSize);
    this.observer.observe(this.el);
  }

  componentDidLoad() {
    this.setSize();
  }

  disconnectedCallback() {
    this.observer.disconnect();
  }

  render() {
    const content = [
      <div class='ImageGridItem-imageWrapper'>
        <slot name='image' />
      </div>,

      <div class='ImageGridItem-overlay'>
        <div class='ImageGridItem-textWrapper'>
          <h5 class='ImageGridItem-headline'>{this.headline}</h5>
          <app-copytext class='ImageGridItem-text'>
            <slot />
          </app-copytext>
        </div>
        {this.linkText && this.href ? (
          <div class='ImageGridItem-link'>
            <span class='ImageGridItem-linkText'>{this.linkText}</span>
            <span class='ImageGridItem-linkIcon app-icon--arrow-right'></span>
          </div>
        ) : null}
      </div>,
    ];

    return (
      <Host
        class={`
                    ImageGridItem
                    ImageGridItem--${this.size}
                    ${this.linkText && this.href ? "ImageGridItem--linked" : ""}
                `}
        onTouchStart={this.handleTouch}
      >
        {this.linkText && this.href ? (
          <a
            class='ImageGridItem-wrapper'
            href={this.href}
            target={this.target}
            rel={this.target === "_blank" ? "noopener noreferrer" : null}
          >
            {content}
          </a>
        ) : (
          <div class='ImageGridItem-wrapper'>{content}</div>
        )}
      </Host>
    );
  }
}
