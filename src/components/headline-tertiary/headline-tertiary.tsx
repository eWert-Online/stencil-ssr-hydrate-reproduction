import { Component, Host, h, Prop } from "@stencil/core";

@Component({
  tag: "app-headline-tertiary",
  styleUrl: "headline-tertiary.scss",
  shadow: true,
})
export class appHeadlineTertiary {
  /**
   * The level to use for this headline.
   * Defaults to "h2"
   */
  @Prop() public tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" = "h2";

  /**
   * The text for the headline
   */
  @Prop() public text?: string;

  /**
   * If the headline should be highlighted (displayed in red)
   */
  @Prop() public highlight?: boolean = false;

  render() {
    return (
      <Host>
        <this.tag class={`HeadlineTertiary ${this.highlight ? "HeadlineTertiary--highlight" : ""}`}>
          {this.text}
        </this.tag>
      </Host>
    );
  }
}
