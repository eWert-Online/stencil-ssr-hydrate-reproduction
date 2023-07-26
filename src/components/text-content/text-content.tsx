import { Component, h, Host, Element } from "@stencil/core";

@Component({
  tag: "app-text-content",
  styleUrl: "text-content.scss",
  shadow: true,
})
export class AppTextContent {
  @Element() private el: HTMLAppTextContentElement;

  private slot = null;

  private setSlottedContent = () => {
    const contentNodes = this.slot
      .assignedNodes({
        flatten: true,
      })
      .filter((node) => node.nodeName !== "#text") as Array<HTMLElement>;
    const lastEl = contentNodes.pop();
    if (lastEl) {
      lastEl.style.marginBottom = "0";
    }
  };

  componentDidLoad() {
    this.slot = this.el.shadowRoot.querySelector("slot");
    this.setSlottedContent();
    this.slot.addEventListener("slotchange", this.setSlottedContent);
  }

  disconnectedCallback() {
    this.slot.removeEventListener("slotchange", this.setSlottedContent);
  }

  render() {
    return (
      <Host
        class={`
                    TextContent
                `}
      >
        <slot />
      </Host>
    );
  }
}
