import { Component, h, Host, Prop } from "@stencil/core";

/**
 * @slot *default* - The cite of the quote
 * @slot intro - The module intro to display above this module
 */
@Component({
  tag: "app-quote",
  styleUrl: "quote.scss",
  shadow: true,
})
export class AppQuote {
  /**
   * The Quotes text content
   */
  @Prop() quote!: string;

  render() {
    return (
      <Host
        class={`
                    Quote
                `}
      >
        <div class='Quote-intro'>
          <slot name='intro' />
        </div>
        <div class='Quote-container'>
          <span class='Quote-icon' />
          <blockquote class='Quote-content'>{this.quote}</blockquote>
          <aside class='Quote-cite'>
            <slot />
          </aside>
        </div>
      </Host>
    );
  }
}
