import { Component, h, Host } from "@stencil/core";

/**
 * @slot *default* - A list of <app-event-list-item> to display in a grid
 * @slot intro - Elements to display above the event-list
 */
@Component({
  tag: "app-event-list",
  styleUrl: "event-list.scss",
  shadow: true,
})
export class AppEventList {
  render() {
    return (
      <Host
        class={`
                    EventList
                `}
      >
        <div class='EventList-intro'>
          <slot name='intro' />
        </div>

        <div class='EventList-teasers'>
          <slot />
        </div>
      </Host>
    );
  }
}
