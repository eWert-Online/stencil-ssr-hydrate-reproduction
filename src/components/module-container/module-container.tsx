import { Component, Host, h } from "@stencil/core";

/**
 * @slot *default* - A list of modules (organisms)
 */
@Component({
  tag: "app-module-container",
  styleUrl: "module-container.scss",
  shadow: true,
})
export class appModuleContainer {
  render() {
    return (
      <Host
        class={`
                    ModuleContainer
                `}
      >
        <slot />
      </Host>
    );
  }
}
