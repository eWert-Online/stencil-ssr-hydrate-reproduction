import { Component, Host, h, Element, State } from "@stencil/core";

/**
 * @slot *default* - 2 - 4 Buttons show in a row
 * @slot intro - A module-intro to display above the button-list
 */
@Component({
  tag: "app-button-list",
  styleUrl: "button-list.scss",
  shadow: true,
})
export class AppButtonList {
  @Element() el: HTMLAppButtonListElement;

  @State() buttonCount: number = 4;

  private setButtonCount = () => {
    const slots = Array.from(this.el.shadowRoot.querySelectorAll("slot"));
    this.buttonCount = slots
      .find((slot) => slot.name === "")
      ?.assignedNodes({
        flatten: true,
      })
      ?.filter((node) => node.nodeName !== "#text")?.length;
  };

  componentDidLoad() {
    this.setButtonCount();
  }

  componentWillUpdate() {
    this.setButtonCount();
  }

  render() {
    return (
      <Host
        class={`
                    ButtonList
                    ButtonList--${this.buttonCount}
                `}
      >
        <slot name='intro' />
        <div class='ButtonList-buttons'>
          <slot />
        </div>
      </Host>
    );
  }
}
