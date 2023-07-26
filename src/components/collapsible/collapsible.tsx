import { Component, h, Host } from "@stencil/core";

/**
 * @slot *default* - A list of <app-collapsible-item> to display in a grid
 * @slot intro - Elements to display above the collapsible
 */
@Component({
  tag: "app-collapsible",
  styleUrl: "collapsible.scss",
  shadow: true,
})
export class AppCollapsible {
  render() {
    return (
      <Host
        class={`
                    Collapsible
                `}
      >
        <div class='Collapsible-intro'>
          <slot name='intro' />
        </div>

        <div class='Collapsible-tabs'>
          <slot />
        </div>
      </Host>
    );
  }
}
