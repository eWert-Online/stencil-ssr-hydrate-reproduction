import { Component, h, Prop, Host } from "@stencil/core";

@Component({
  tag: "app-text-with-background",
  styleUrl: "text-with-background.scss",
  shadow: true,
})
export class AppTextWithBackground {
  /**
   * The side on which the content should be displayed
   */
  @Prop() public alignContent?: "left" | "right" = "left";

  /**
   * XSmall source of the background image
   */
  @Prop() public backgroundImageXsmall?: string;

  /**
   * Small source of the background image
   */
  @Prop() public backgroundImageSmall?: string;

  /**
   * Medium source of the background image
   */
  @Prop() public backgroundImageMedium?: string;

  /**
   * Large source of the background image
   */
  @Prop() public backgroundImageLarge?: string;

  /**
   * XLarge source of the background image
   */
  @Prop() public backgroundImageXlarge?: string;

  render() {
    return (
      <Host
        class={`
                    TextWithBackground
                    TextWithBackground--${this.alignContent}
                `}
      >
        <div class='TextWithBackground-intro'>
          <slot name='intro' />
        </div>
        <div class='TextWithBackground-wrapper'>
          <app-image
            class='TextWithBackground-background'
            background={true}
            alt=''
            xsmall={this.backgroundImageXsmall}
            small={this.backgroundImageSmall}
            medium={this.backgroundImageMedium}
            large={this.backgroundImageLarge}
            xlarge={this.backgroundImageXlarge}
          />
          <div class='TextWithBackground-container'>
            <app-text-content class='TextWithBackground-content'>
              <slot />
            </app-text-content>
          </div>
        </div>
      </Host>
    );
  }
}
