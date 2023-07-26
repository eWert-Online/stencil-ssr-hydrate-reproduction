import { Host, Component, h, Prop } from "@stencil/core";

@Component({
  tag: "app-ordered-list-item",
  styleUrl: "ordered-list-item.scss",
  shadow: true,
})
export class AppOrderedListItem {
  /**
   * The label of this list item (optional)
   */
  @Prop() public label?: string;

  render() {
    return (
      <Host class='OrderedListItem'>
        <span class='OrderedListItem-text'>
          {this.label && <span class='OrderedListItem-title'>{this.label}</span>}
          <slot />
        </span>
      </Host>
    );
  }
}
