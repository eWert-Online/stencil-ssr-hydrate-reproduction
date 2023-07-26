import { Component, Host, h, Prop } from "@stencil/core";

@Component({
  tag: "app-select-option-group",
  styleUrl: "select-option-group.scss",
  shadow: true,
})
export class AppSelectOptionGroup {
  /**
   * label
   */
  @Prop() public label = "";

  render() {
    return (
      <Host>
        <div class='title'>{this.label}</div>
        <div class='options'>
          <slot />
        </div>
      </Host>
    );
  }
}
