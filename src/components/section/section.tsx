import { Component, Host, h } from "@stencil/core";

/**
 * @slot *default* - One or many modules to show inside of the section
 * @slot intro - A section-intro with app-headline-secondary, app-copytext in L or M and CTAs to show above the section
 */
@Component({
  tag: "app-section",
  styleUrl: "section.scss",
  shadow: true,
})
export class appSection {
  render() {
    return (
      <Host
        class={`
                    Section
                `}
      >
        <slot name='intro' />
        <app-module-container>
          <slot />
        </app-module-container>
      </Host>
    );
  }
}
