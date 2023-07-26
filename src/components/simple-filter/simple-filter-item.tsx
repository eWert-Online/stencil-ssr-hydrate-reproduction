import { Component, h, Host, Prop } from "@stencil/core";

/**
 * @slot *default* - The content do show / hide based on the selected filter
 */
@Component({
  tag: "app-simple-filter-item",
  shadow: true,
})
export class AppSimpleFilterItem {
  /**
   * The tag of this item
   */
  @Prop() public tag: string;

  /**
   * If the item is currently hidden or visible
   */
  @Prop() public hidden: boolean = false;

  render() {
    return <Host style={{ display: this.hidden ? "none" : null }}>{!this.hidden ? <slot /> : null}</Host>;
  }
}
