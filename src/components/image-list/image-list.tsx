import { Component, h, Host, Element, State } from "@stencil/core";
import ResizeObserver from "resize-observer-polyfill";

/**
 * @slot intro - The module intro to display above this module
 * @slot *default* - A list of <app-image-list-item> to display in a grid
 */
@Component({
  tag: "app-image-list",
  styleUrl: "image-list.scss",
  shadow: true,
})
export class AppImageList {
  @Element() el: HTMLAppImageListElement;

  @State() childrenCount: number = 4;

  private images: Array<HTMLAppImageElement>;
  private observer: ResizeObserver;

  private setChildrenCount = () => {
    this.childrenCount = this.el.querySelectorAll("app-image-list-item").length;
  };

  private setHeighestImage = () => {
    this.images = Array.from(this.el.querySelectorAll("app-image-list-item > app-image")) as Array<HTMLAppImageElement>;
    const highestImage = this.images.reduce((acc, image) => {
      const imageHeight = image.getBoundingClientRect().height;
      if (imageHeight > acc) {
        return imageHeight;
      }
      return acc;
    }, 0);

    this.el.querySelectorAll("app-image-list-item").forEach((item) => {
      item.highestImage = highestImage;
    });
  };

  connectedCallback() {
    this.setChildrenCount();
    this.observer = new ResizeObserver(this.setHeighestImage);
    this.observer.disconnect();
    this.el.querySelectorAll("app-image-list-item > app-image").forEach((image) => {
      this.observer.observe(image);
    });
  }

  componentWillUpdate() {
    this.setChildrenCount();
  }

  render() {
    return (
      <Host
        class={`
                    ImageList
                    ImageList--${this.childrenCount}
                `}
      >
        <div class='ImageList-intro'>
          <slot name='intro' />
        </div>
        <div class='ImageList-images'>
          <slot />
        </div>
      </Host>
    );
  }
}
