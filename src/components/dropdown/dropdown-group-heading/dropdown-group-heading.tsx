import { Component, Prop, h, Host } from "@stencil/core";

/**
 * Renders a dropdown group heading which is meant to be used as slotted content for the clustered flavour of <app-dropdown> element.
 */
@Component({
  tag: "app-dropdown-group-heading",
  styleUrl: "dropdown-group-heading.scss",
  shadow: true,
})
export class AppDropdownGroupHeading {
  /**
   * The text dropdown group heading
   */
  @Prop() public text: string;

  render() {
    return (
      <Host>
        <span>{this.text}</span>
      </Host>
    );
  }
}
