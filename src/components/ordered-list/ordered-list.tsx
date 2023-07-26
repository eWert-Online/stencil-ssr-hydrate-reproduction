import { Component, Host, h, Prop } from "@stencil/core";

@Component({
  tag: "app-ordered-list",
  styleUrl: "ordered-list.scss",
  shadow: true,
})
export class OrderedList {
  /**
   * The font-size of the list.
   */
  @Prop() public size?: "S" | "M" | "L" | "XL" = "M";

  render() {
    return (
      <Host
        class={`
                    OrderedList
                    ${this.size ? "OrderedList--" + this.size.toLowerCase() : ""}
                `}
      >
        <ol>
          <slot />
        </ol>
      </Host>
    );
  }
}
