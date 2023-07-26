import { Component, h, Host } from "@stencil/core";

/**
 * @slot intro - The module-intro to display above this module (optional)
 * @slot media - The <app-image> <app-video> or <app-youtube-embed> to display in this module
 * @slot *default* - The optional caption of this module
 */
@Component({
  tag: "app-media-container",
  styleUrl: "media-container.scss",
  shadow: true,
})
export class AppMediaContainer {
  render() {
    return (
      <Host
        class={`
                    MediaContainer
                `}
      >
        <div class='MediaContainer-intro'>
          <slot name='intro' />
        </div>
        <div class='MediaContainer-media'>
          <slot name='media' />
        </div>
        <div class='MediaContainer-caption'>
          <slot />
        </div>
      </Host>
    );
  }
}
