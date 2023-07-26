import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "app-text",
  styleUrl: "text.scss",
  shadow: true,
})
export class AppText {
  render() {
    return (
      <Host
        class={`
                    Text
                `}
      >
        <div class='Text-intro'>
          <slot name='intro' />
        </div>
        <app-text-content class='Text-content'>
          <slot />
        </app-text-content>
      </Host>
    );
  }
}
