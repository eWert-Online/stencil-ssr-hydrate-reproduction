import { Component, Host, h, Prop, Element, Watch } from "@stencil/core";

@Component({
  tag: "app-unordered-list",
  styleUrl: "unordered-list.scss",
  shadow: true,
})
export class UnorderedList {
  @Element() el: HTMLAppUnorderedListElement;
  /**
   * The font-size of the list.
   */
  @Prop() public size?: "S" | "M" | "L" | "XL" = "M";

  /**
   * If the unordered list should be displayed inverted (white instead of black)
   */
  @Prop() public inverted?: boolean = false;

  @Watch("inverted")
  watchHandler(inverted) {
    this.el.querySelectorAll("app-unordered-list-item").forEach((item) => {
      if (inverted) {
        item.classList.add("UnorderedListItem--inverted");
      } else {
        item.classList.remove("UnorderedListItem--inverted");
      }
    });
  }

  render() {
    return (
      <Host
        class={`
                    UnorderedList
                    ${this.size ? "UnorderedList--" + this.size.toLowerCase() : ""}
                    ${this.inverted ? "UnorderedList--inverted" : ""}
                `}
      >
        <ul>
          <slot />
        </ul>
      </Host>
    );
  }
}
