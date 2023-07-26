import { Component, h, Host, Element, State, Prop } from "@stencil/core";

@Component({
  tag: "app-media-text-thumbnail",
  styleUrl: "media-text-thumbnail.scss",
  shadow: true,
})
export class AppMediaTextThumbnail {
  @Element() el: HTMLAppMediaTextThumbnailElement;
  /**
   * The size of the image or video
   */
  @Prop() public mediaSize?: "S" | "M" | "L" = "M";

  /**
   * The alignment of the image or video
   */
  @Prop() public mediaAlignment?: "left" | "right" = "left";

  /**
   * The default (grey) text for the thumbnails headline
   */
  @Prop() public thumbnailsHeadline?: string;

  @State() thumbnails: Array<HTMLAppImageElement> = [];
  @State() originalImages: Array<HTMLAppImageElement> = [];

  private thumbnailsSlot: HTMLSlotElement = null;
  private originalImagesSlot: HTMLSlotElement = null;

  private getThumbnails = () => {
    return this.thumbnailsSlot
      .assignedNodes({ flatten: true })
      .filter((node) => node.nodeName === "WAREMA-IMAGE") as HTMLAppImageElement[];
  };

  private getOriginalImages = () => {
    return this.originalImagesSlot
      .assignedNodes({ flatten: true })
      .filter((node) => node.nodeName === "WAREMA-IMAGE") as HTMLAppImageElement[];
  };

  componentDidLoad() {
    this.thumbnailsSlot = this.el.shadowRoot.querySelector('slot[name="thumbnail"]');
    this.originalImagesSlot = this.el.shadowRoot.querySelector('slot[name="original"]');

    this.thumbnails = this.getThumbnails();
    this.originalImages = this.getOriginalImages();

    this.thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener("click", (event) => {
        event.preventDefault();

        this.originalImages.every((image) => {
          if (!image.classList.contains("hidden")) {
            image.classList.add("hidden");
            return false;
          }
          return true;
        });

        this.originalImages[index].classList.remove("hidden");

        this.thumbnails.forEach((thumbnail) => {
          thumbnail.classList.remove("active");
        });
        thumbnail.classList.add("active");
      });
    });

    this.originalImages.forEach((image, index) => {
      if (index > 0) {
        image.classList.add("hidden");
      }
    });

    this.thumbnails[0]?.classList.add("active");
  }

  render() {
    return (
      <Host
        class={`
                    MediaTextThumbnail
                    MediaTextThumbnail--${this.mediaSize.toLowerCase()}
                    MediaTextThumbnail--${this.mediaAlignment.toLowerCase()}
                `}
      >
        <div class='MediaTextThumbnail-intro'>
          <slot name='intro' />
        </div>
        <div class='MediaTextThumbnail-wrapper'>
          <div class='MediaTextThumbnail-container'>
            <div class='MediaTextThumbnail-media'>
              <div class='MediaTextThumbnail-original'>
                <slot name='original' />
              </div>
              <div class='MediaTextThumbnail-thumbnails'>
                <p>{this.thumbnailsHeadline}</p>
                <slot name='thumbnail' />
              </div>
            </div>
            <app-text-content class='MediaTextThumbnail-content'>
              <slot />
            </app-text-content>
          </div>
        </div>
      </Host>
    );
  }
}
