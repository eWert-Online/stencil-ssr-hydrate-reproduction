import { Component, Host, h } from "@stencil/core";

/**
 * @slot *default* - One or many modules to show inside of the section
 */
@Component({
  tag: "app-section",
  styleUrl: "section.scss",
  shadow: true,
})
export class AppSection {
  render() {
    return (
      <Host
        class={`
            Section
        `}
      >
        <slot />
      </Host>
    );
  }
}
