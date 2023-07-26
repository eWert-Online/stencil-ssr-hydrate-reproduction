import { Component, Host, h, Prop, State, Element } from "@stencil/core";

@Component({
  tag: "app-module-intro",
  styleUrl: "module-intro.scss",
  shadow: true,
})
export class appModuleIntro {
  @Element() private el: HTMLAppModuleIntroElement;

  /**
   * The level to use for the headline.
   * Defaults to "h3"
   */
  @Prop() public headlineTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" = "h3";

  /**
   * The text for the headline
   */
  @Prop() public headlineText: string;

  /**
   * If the headline should be highlighted (displayed in red)
   */
  @Prop() public highlight?: boolean = false;

  /**
   * The font-size of the copytext.
   */
  @Prop() public textSize?: "M" | "L" = "M";

  @State() private hasCopytext: boolean = false;

  connectedCallback() {
    this.hasCopytext = !!this.el.querySelector("*");
  }

  componentDidUpdate() {
    this.hasCopytext = !!this.el.querySelector("*");
  }

  render() {
    const isEmpty = !this.hasCopytext && !this.headlineText;

    if (isEmpty) {
      return null;
    }

    return (
      <Host
        class={`
                    ModuleIntro
                    ${this.textSize ? "ModuleIntro--" + this.textSize.toLowerCase() : ""}
                `}
      >
        {this.headlineText && (
          <app-headline-tertiary
            class='ModuleIntro-headline'
            tag={this.headlineTag}
            text={this.headlineText}
            highlight={this.highlight}
          />
        )}
        {this.hasCopytext && (
          <app-copytext class='ModuleIntro-text' size={this.textSize}>
            <slot />
          </app-copytext>
        )}
      </Host>
    );
  }
}
