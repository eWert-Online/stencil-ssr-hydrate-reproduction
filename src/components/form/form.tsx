import { Component, h, Prop, Host } from "@stencil/core";

@Component({
  tag: "app-form",
  styleUrl: "form.scss",
  shadow: false,
})
export class AppForm {
  /**
   * The alignment of the image
   */
  @Prop() public imageAlignment?: "left" | "right" = "left";

  render() {
    return (
      <Host
        class={`
                    Form
                    Form--${this.imageAlignment.toLowerCase()}
                `}
      >
        <div class='Form-intro'>
          <slot name='intro' />
        </div>

        <div class='Form-wrapper'>
          <slot />
        </div>
      </Host>
    );
  }
}
