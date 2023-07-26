import { Component, h, Prop, Host, Element, Event, EventEmitter } from "@stencil/core";

/**
 * @slot *default* - The content to display inside of this collapsible item
 */
@Component({
  tag: "app-tab",
  styleUrl: "tab.scss",
  shadow: true,
})
export class AppTab {
  @Element() private el: HTMLAppTabElement;

  /**
   * The bold text-part of the tab.
   * This always appears before the regular text
   */
  @Prop() public headlineBold?: string;

  /**
   * The text of the tab
   */
  @Prop() public headline: string;

  /**
   * If this item is currently open
   */
  @Prop({ mutable: true }) public open: boolean = false;

  /**
   * Emitted with the tabs content, on open
   */
  @Event() private stOpen: EventEmitter<HTMLAppTabElement>;

  private openItem = () => {
    this.stOpen.emit(this.el);
    this.open = true;
  };

  componentDidLoad() {
    if (this.open) {
      this.openItem();
    }
  }

  render() {
    return (
      <Host
        class={`
                    Tab
                    ${this.open ? "Tab--open" : ""}
                `}
      >
        <div class='Tab-container'>
          <button class='Tab-toggle' onClick={this.openItem}>
            {this.headlineBold && <b>{this.headlineBold}</b>} {this.headline}
          </button>
        </div>
        <div class='Tab-content' style={{ display: "none" }}>
          <slot />
        </div>
      </Host>
    );
  }
}
