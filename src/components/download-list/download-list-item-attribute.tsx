import { Component, Prop, Host, h } from "@stencil/core";

@Component({
  tag: "app-download-list-item-attribute",
  styleUrl: "download-list-item-attribute.scss",
  shadow: true,
})
export class AppDownloadListItemAttribute {
  /**
   * The label of the attribute
   */
  @Prop() public label!: string;

  /**
   * The text of the attribute
   */
  @Prop() public value!: string;

  render() {
    return (
      <Host class='DownloadListItem-attribute'>
        <span class='DownloadListItem-attribute-inner'>
          <label>{this.label}:</label>
          <span class='value'>{this.value}</span>
        </span>
      </Host>
    );
  }
}
