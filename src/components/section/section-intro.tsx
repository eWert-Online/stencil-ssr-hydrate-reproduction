import { Component, Host, h, State, Prop, Element } from "@stencil/core";

/**
 * @slot *default* - app-headline-secondary, app-copytext in L or M and CTAs to show above the section
 */
@Component({
  tag: "app-section-intro",
  styleUrl: "section-intro.scss",
  shadow: true,
})
export class appSectionIntro {
  @Element() private el: HTMLAppSectionIntroElement;

  /**
   * Set this to true, if the Section headline should be the full container width
   */
  @Prop() fullWidth: boolean = false;

  @State() private hasHeadline: boolean = false;
  @State() private hasCopytext: boolean = false;

  connectedCallback() {
    this.hasHeadline = !!this.el.querySelector("app-headline-secondary");
    this.hasCopytext = !!this.el.querySelector("app-copytext");
  }

  componentDidUpdate() {
    this.hasHeadline = !!this.el.querySelector("app-headline-secondary");
    this.hasCopytext = !!this.el.querySelector("app-copytext");
  }

  render() {
    const isEmpty = !this.hasCopytext && !this.hasHeadline;

    if (isEmpty) {
      return null;
    }

    return (
      <Host
        class={`
                    SectionIntro
                    ${this.fullWidth ? "SectionIntro--fullWidth" : ""}
                `}
      >
        <slot />
      </Host>
    );
  }
}
