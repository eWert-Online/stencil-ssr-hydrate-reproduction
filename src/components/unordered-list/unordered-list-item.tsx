import { Host, Component, h, Prop } from "@stencil/core";

@Component({
  tag: "app-unordered-list-item",
  styleUrl: "unordered-list-item.scss",
  shadow: true,
})
export class AppUnorderedListItem {
  /**
   * The label of this list item (optional)
   */
  @Prop() public label?: string;

  /**
   * The level of this list item
   */
  @Prop() public level: number = 1;

  /**
   * The path to the custom icon of this list item (optional)
   */
  @Prop() public iconSrc?: string;

  render() {
    return (
      <Host
        class={`
                    UnorderedListItem
                    UnorderedListItem--level-${this.level}
                `}
      >
        <li class='UnorderedListItem-li'>
          {this.iconSrc ? (
            <img
              class='UnorderedListItem-icon UnorderedListItem-icon--custom'
              src={this.iconSrc}
              aria-hidden='true'
              alt=''
            />
          ) : (
            <span class='UnorderedListItem-icon' />
          )}
          <span class='UnorderedListItem-text'>
            {this.label && <span class='UnorderedListItem-title'>{this.label}</span>}
            <slot />
          </span>
        </li>
      </Host>
    );
  }
}
