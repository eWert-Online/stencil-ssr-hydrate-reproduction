import { Component, Host, h, Prop, Element, State } from "@stencil/core";

/**
 * @slot intro - The module intro to display above this module
 * @slot *default* - A list of <app-download-list-item> to display in a table
 */

@Component({
  tag: "app-download-list",
  styleUrl: "download-list.scss",
  shadow: true,
})
export class AppDownloadList {
  @Element() el: HTMLAppDownloadListElement;

  /**
   * The table headline for the name column
   */
  @Prop() nameLabel: string;

  /**
   * The table headline for the actions column
   */
  @Prop() actionLabel: string;

  @State() head: Array<string> = [];

  connectedCallback() {
    const listElements = this.el.querySelectorAll("app-download-list-item");
    const attributeElements = listElements[0]?.querySelectorAll("app-download-list-item-attribute");
    if (attributeElements) {
      this.head = Array.from(attributeElements).map((attribute) => attribute.label);
    }

    listElements.forEach((item) => {
      item.noHead = this.head.length === 0;
    });
  }

  render() {
    return (
      <Host
        class={`
                    DownloadList
                    ${this.head.length > 0 ? "" : "DownloadList--without-head"}
                `}
      >
        <div class='DownloadList-intro'>
          <slot name='intro' />
        </div>

        <ul class='DownloadList-downloads'>
          {this.head.length > 0 ? (
            <app-download-list-head actionLabel={this.actionLabel} nameLabel={this.nameLabel}>
              {this.head.map((label) => (
                <span>{label}</span>
              ))}
            </app-download-list-head>
          ) : null}
          <slot />
        </ul>

        <div class='DownloadList-cta'>
          <slot name='cta' />
        </div>
      </Host>
    );
  }
}
