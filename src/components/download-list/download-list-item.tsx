import { Host, Component, h, Prop } from "@stencil/core";
import { downloadFile, getFilenameFromUrl } from "../../utils/utils";

/**
 * @slot *default* - The attributes to display after the name
 */

@Component({
  tag: "app-download-list-item",
  styleUrl: "download-list-item.scss",
  shadow: true,
})
export class AppDownloadListItem {
  /**
   * The name of this list item
   */
  @Prop() public name?: string;

  /**
   * The download link of this list item
   */
  @Prop() public downloadLink?: string;

  /**
   * The download link text of this list item
   */
  @Prop() public downloadLinkText?: string;

  /**
   * The link of this list item
   */
  @Prop() public link?: string;

  /**
   * The subject of the mailto link (optional)
   */
  @Prop() public mailSubject?: string = "";

  /**
   * The body of the mailto link
   */
  @Prop() public mailText: string = "";

  /**
   * The send link text of this list item
   */
  @Prop() public sendLinkText?: string;

  /**
   *
   */
  @Prop() public noHead?: boolean;

  private download = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const filename = getFilenameFromUrl(this.downloadLink);
    downloadFile(this.downloadLink, filename);
  };

  render() {
    return (
      <Host
        class={`
                    DownloadListItem
                    ${this.noHead ? "DownloadListItem--without-head" : ""}
                `}
      >
        <li class='DownloadListItem-li'>
          <span class='DownloadListItem-name'>
            <a
              class='DownloadListItem-link'
              href={this.downloadLink ? this.downloadLink : this.link}
              target='_blank'
              rel='noopener noreferrer'
              onClick={this.downloadLink ? this.download : null}
            >
              {this.name}
            </a>
          </span>
          <slot />
          <span class='DownloadListItem-action'>
            <app-link-primary
              class='DownloadListItem-download'
              href={this.downloadLink ? this.downloadLink : this.link}
              icon-left='download-small'
              target='_blank'
              title={this.downloadLinkText ? this.downloadLinkText : null}
              onClick={this.downloadLink ? this.download : null}
            ></app-link-primary>
            <app-link-primary
              class='DownloadListItem-send'
              href={`mailto:?subject=${window.encodeURIComponent(this.mailSubject)}&body=${window.encodeURIComponent(
                this.mailText,
              )}`}
              icon-left='envelope'
              target='_blank'
              title={this.sendLinkText ? this.sendLinkText : null}
            ></app-link-primary>
          </span>
        </li>
      </Host>
    );
  }
}
