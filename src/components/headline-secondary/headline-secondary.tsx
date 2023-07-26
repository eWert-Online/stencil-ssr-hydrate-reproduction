import { Component, Host, h, Prop } from "@stencil/core";

@Component({
  tag: "app-headline-secondary",
  styleUrl: "headline-secondary.scss",
  shadow: true,
})
export class appHeadlineSecondary {
  /**
   * The level to use for this headline.
   * Defaults to "h2"
   */
  @Prop() public tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" = "h2";

  /**
   * The default (black) text for the headline
   */
  @Prop() public text?: string;

  /**
   * The highlighted (red) text for the headline.
   * This appears above the black text
   */
  @Prop() public textRed?: string;

  render() {
    return (
      <Host>
        <this.tag class='HeadlineSecondary'>
          {this.textRed ? <span class='HeadlineSecondary-highlight'>{this.textRed}</span> : null}
          {this.text}
        </this.tag>
      </Host>
    );
  }
}
