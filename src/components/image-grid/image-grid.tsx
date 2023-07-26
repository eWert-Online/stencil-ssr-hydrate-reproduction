import { Component, h, Host, Element, State } from "@stencil/core";

/**
 * @slot intro - The module intro to display above this module
 * @slot *default* - A list of <app-image-grid-item> to display in a grid
 */
@Component({
  tag: "app-image-grid",
  styleUrl: "image-grid.scss",
  shadow: true,
})
export class AppImageGrid {
  @Element() el: HTMLAppImageGridElement;

  @State() childrenCount: number = 1;

  private setChildrenCount = () => {
    this.childrenCount = this.el.querySelectorAll("app-image-grid-item").length;
  };

  connectedCallback() {
    this.setChildrenCount();
  }

  componentWillUpdate() {
    this.setChildrenCount();
  }

  render() {
    return (
      <Host
        class={`
                    ImageGrid
                    ImageGrid--${this.childrenCount}
                `}
      >
        <div class='ImageGrid-intro'>
          <slot name='intro' />
        </div>

        <div class='ImageGrid-images'>
          <slot />
        </div>
      </Host>
    );
  }
}
