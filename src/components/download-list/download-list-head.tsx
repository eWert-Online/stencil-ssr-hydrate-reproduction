import { Host, Component, h, Prop } from "@stencil/core";

/**
 * @slot *default* - The attribute labels to display inside the list head
 */

@Component({
  tag: "app-download-list-head",
  styleUrl: "download-list-head.scss",
  shadow: true,
})
export class AppDownloadListHead {
  /**
   * The name label of this list item
   */
  @Prop() public nameLabel?: string;

  /**
   * The action label of this list item
   */
  @Prop() public actionLabel?: string;

  render() {
    return (
      <Host class='DownloadListHead'>
        <li class='DownloadListHead-li'>
          <span class='DownloadListHead-name'>{this.nameLabel}</span>
          <slot />
          <span class='DownloadListHead-action'>{this.actionLabel}</span>
        </li>
      </Host>
    );
  }
}
