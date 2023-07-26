import { Component, h, Host, Element } from "@stencil/core";

/**
 * @slot intro - The module intro to display above this module
 * @slot *default* - A list of <app-contact-list-item> to display in a grid
 */
@Component({
  tag: "app-contact-list",
  styleUrl: "contact-list.scss",
  shadow: true,
})
export class appContactList {
  @Element() private el: HTMLAppContactListElement;

  private contacts: Array<HTMLAppContactListItemElement> = [];

  connectedCallback() {
    this.contacts = Array.from(this.el.querySelectorAll("app-contact-list-item"));
  }

  render() {
    return (
      <Host
        class={`
                    ContactList
                    ContactList--${this.contacts.length}
                `}
      >
        <slot name='intro' />

        <div class='ContactList-contacts'>
          <slot />
        </div>
      </Host>
    );
  }
}
