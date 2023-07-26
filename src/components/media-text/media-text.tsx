import { Component, h, Prop, Host } from "@stencil/core";

@Component({
  tag: "app-media-text",
  styleUrl: "media-text.scss",
  shadow: true,
})
export class AppMediaText {
  /**
   * The size of the image or video
   */
  @Prop() public mediaSize?: "S" | "M" | "L" = "M";

  /**
   * The alignment of the image or video
   */
  @Prop() public mediaAlignment?: "left" | "right" = "left";

  render() {
    return (
      <Host
        class={`
                    MediaText
                    MediaText--${this.mediaSize.toLowerCase()}
                    MediaText--${this.mediaAlignment.toLowerCase()}
                `}
      >
        <div class='MediaText-intro'>
          <slot name='intro' />
        </div>
        <div class='MediaText-wrapper'>
          <div class='MediaText-container'>
            <div class='MediaText-media'>
              <slot name='media' />
            </div>
            <app-text-content class='MediaText-content'>
              <slot />
            </app-text-content>
          </div>
        </div>
      </Host>
    );
  }
}
