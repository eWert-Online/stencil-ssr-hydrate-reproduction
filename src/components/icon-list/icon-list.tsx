import { Component, h, Host, Prop } from "@stencil/core";

/**
 * @slot *default* - A list of <app-icon-list-item> to display
 * @slot intro - The module-intro to display above this module (optional)
 */
@Component({
  tag: "app-icon-list",
  styleUrl: "icon-list.scss",
  shadow: true,
})
export class AppIconList {
  /**
   * The number of columns the items should be distributed upon
   */
  @Prop() columns: 1 | 2 | 3 = 3;

  render() {
    return (
      <Host
        class={`
                    IconList
                    IconList--${this.columns}
                `}
      >
        <slot name='intro' />
        <div class='IconList-items'>
          <slot />
        </div>
      </Host>
    );
  }
}
