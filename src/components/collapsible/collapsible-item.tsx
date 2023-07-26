import { Component, h, Prop, Host, Element, State } from "@stencil/core";
import ResizeObserver from "resize-observer-polyfill";

/**
 * @slot *default* - The content to display inside of this collapsible item
 */
@Component({
  tag: "app-collapsible-item",
  styleUrl: "collapsible-item.scss",
  shadow: true,
})
export class AppCollapsibleItem {
  @Element() private el: HTMLAppCollapsibleItemElement;

  /**
   * The bold text-part of the item.
   * This always appears before the regular text
   */
  @Prop() public headlineBold?: string;

  /**
   * The headline of the item
   */
  @Prop() public headline: string;

  /**
   * If this item should be open initially
   */
  @Prop() public initialOpen: boolean = false;

  @State() open: boolean = false;
  @State() height: number = 0;

  private observer: ResizeObserver;

  private setHeight = () => {
    const element = this.el.shadowRoot.querySelector(".CollapsibleItem-content") as HTMLDivElement;
    this.height = element.getBoundingClientRect().height;
  };

  private openItem = () => {
    this.setHeight();
    this.open = true;
    this.observer.observe(this.el);
  };

  private closeItem = () => {
    this.open = false;
    this.height = 0;
    this.observer.unobserve(this.el);
  };

  private toggleItem = () => {
    if (this.open) {
      this.closeItem();
    } else {
      this.openItem();
    }
  };

  connectedCallback() {
    this.observer = new ResizeObserver(() => {
      if (this.open) {
        this.setHeight();
      }
    });
  }

  componentDidLoad() {
    if (this.initialOpen) {
      this.openItem();
    }
  }

  disconnectedCallback() {
    this.observer.unobserve(this.el);
  }

  render() {
    return (
      <Host
        class={`
                    CollapsibleItem
                    ${this.open ? "CollapsibleItem--open" : ""}
                `}
      >
        <div class='CollapsibleItem-container'>
          <button class='CollapsibleItem-toggle' onClick={this.toggleItem}>
            <span>
              {this.headlineBold && <b>{this.headlineBold}</b>} {this.headline}
            </span>
          </button>
        </div>
        <div class='CollapsibleItem-contentWrapper' style={{ height: `${this.height}px` }}>
          <app-module-container class='CollapsibleItem-content'>
            <slot />
          </app-module-container>
        </div>
        <div class='CollapsibleItem-separator' />
      </Host>
    );
  }
}
