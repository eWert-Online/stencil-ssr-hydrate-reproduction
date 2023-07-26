import { Component, h, Prop, State, Host, Element } from "@stencil/core";
import breakpoints from "../../utils/breakpoints";

/**
 * @slot *default* - The description (rich text) to display below the name or image (depending on the size)
 */
@Component({
  tag: "app-contact-list-item",
  styleUrl: "contact-list-item.scss",
  shadow: true,
})
export class appContactListItem {
  @Element() private el: HTMLAppContactListItemElement;

  /**
   * The alt text of the image
   */
  @Prop() public imageAlt: string;

  /**
   * XSmall source of the image
   */
  @Prop() public imageXsmall?: string;

  /**
   * Small source of the image
   */
  @Prop() public imageSmall?: string;

  /**
   * Medium source of the image
   */
  @Prop() public imageMedium?: string;

  /**
   * Large source of the image
   */
  @Prop() public imageLarge?: string;

  /**
   * XLarge source of the image
   */
  @Prop() public imageXlarge?: string;

  /**
   * The subject to display above the name of the contact
   */
  @Prop() public subject?: string;

  /**
   * The name of the contact
   */
  @Prop() public name: string;

  /**
   * The phone number of the contact
   */
  @Prop() public phone?: string;

  /**
   * The email of the contact encoded as base64
   */
  @Prop() public email?: string;

  /**
   * The href of the contacts email. Format: `mailto:_base64-encoded-email_`
   */
  @Prop() public emailHref?: string;

  /**
   * The current window width
   */
  @State() windowWidth = window.innerWidth;

  private siblingContacts: Array<HTMLAppContactListItemElement> = [];

  private setWindowWidth = () => {
    this.windowWidth = window.innerWidth;
  };

  connectedCallback() {
    this.siblingContacts = Array.from(this.el.parentElement.querySelectorAll("app-contact-list-item"));
    window.addEventListener("resize", this.setWindowWidth);
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this.setWindowWidth);
  }

  render() {
    let size: "MD" | "SM" | "XS" = "MD";

    if (this.siblingContacts.length >= 4) {
      if (this.windowWidth >= breakpoints.large) {
        size = "XS";
      } else if (this.windowWidth >= breakpoints.websiteSmall) {
        size = "MD";
      } else {
        size = "XS";
      }
    } else if (this.siblingContacts.length >= 3) {
      if (this.windowWidth >= breakpoints.medium) {
        size = "XS";
      } else if (this.windowWidth >= breakpoints.websiteSmall) {
        size = "MD";
      } else {
        size = "XS";
      }
    } else if (this.siblingContacts.length >= 2) {
      if (this.windowWidth >= breakpoints.large) {
        size = "SM";
      } else if (this.windowWidth >= breakpoints.small) {
        size = "XS";
      }
    } else {
      if (this.windowWidth >= breakpoints.small) {
        size = "MD";
      }
    }

    return (
      <Host
        class={`
                    ContactListItem
                    ${size ? `ContactListItem--${size.toLowerCase()}` : ""}
                `}
      >
        <div class='ContactListItem-imageContainer'>
          <app-image
            class='ContactListItem-image'
            alt={this.imageAlt}
            xsmall={this.imageXsmall}
            small={this.imageSmall}
            medium={this.imageMedium}
            large={this.imageLarge}
            xlarge={this.imageXlarge}
          />
          {size === "SM" ? (
            <p class='ContactListItem-description'>
              <slot />
            </p>
          ) : null}
        </div>
        <div class='ContactListItem-content'>
          {this.subject && <span class='ContactListItem-subject'>{this.subject}</span>}
          <h5 class='ContactListItem-name'>{this.name}</h5>
          {size === "MD" || size === "XS" ? (
            <p class='ContactListItem-description'>
              <slot />
            </p>
          ) : null}
          <div class='ContactListItem-contact'>
            {this.phone && (
              <a class='ContactListItem-phone' href={`tel:${this.phone}`} target='_blank'>
                <svg
                  class='ContactListItem-phoneIcon'
                  enable-background='new 0 0 500 500'
                  viewBox='0 0 500 500'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path d='m317.9 500h-135.8c-36.2 0-65.7-29.5-65.7-65.7v-368.6c0-36.2 29.5-65.7 65.7-65.7h135.8c36.2 0 65.7 29.5 65.7 65.7v368.5c0 36.3-29.5 65.8-65.7 65.8zm-135.8-480.8c-25.6 0-46.5 20.9-46.5 46.5v368.5c0 25.6 20.9 46.5 46.5 46.5h135.8c25.6 0 46.5-20.9 46.5-46.5v-368.5c0-25.6-20.9-46.5-46.5-46.5z' />
                  <path d='m298.3 403.7h-96.6c-26 0-47.2-21.2-47.2-47.2v-271.7c0-26 21.2-47.2 47.2-47.2h96.6c26 0 47.2 21.2 47.2 47.2v271.8c0 26-21.2 47.1-47.2 47.1zm-96.6-346.9c-15.4 0-27.9 12.5-27.9 27.9v271.8c0 15.4 12.5 27.9 27.9 27.9h96.6c15.4 0 27.9-12.5 27.9-27.9v-271.7c0-15.4-12.5-27.9-27.9-27.9h-96.6z' />
                  <path d='m250 470.5c-15.8 0-28.7-12.8-28.7-28.6s12.9-28.6 28.7-28.6 28.7 12.8 28.7 28.6-12.9 28.6-28.7 28.6zm0-37.9c-5.2 0-9.5 4.2-9.5 9.4s4.3 9.3 9.5 9.3 9.5-4.2 9.5-9.3-4.3-9.4-9.5-9.4z' />
                  <path d='m435.8 287.1c-2.1 0-4.1-.7-5.9-2-4.2-3.3-5-9.3-1.7-13.5 8-10.3 12.3-23.1 12.2-36.1.1-13.1-4.3-26-12.2-36.2-3.2-4.2-2.5-10.2 1.7-13.5 4.2-3.2 10.2-2.5 13.5 1.7 10.6 13.7 16.3 30.7 16.2 48 .1 17.1-5.6 34.2-16.2 47.8-1.9 2.5-4.7 3.8-7.6 3.8z' />
                  <path d='m465.1 315.5c-2.2 0-4.4-.7-6.2-2.2-4.1-3.4-4.6-9.5-1.2-13.5 15.1-18 23.2-40.8 23.1-64.2.2-24.2-8.4-47.4-24.1-65.6-3.5-4-3-10.1 1-13.6s10.1-3 13.6 1c18.8 21.7 29.1 49.5 28.8 78.2.2 27.9-9.6 55.1-27.5 76.6-2.1 2.2-4.8 3.3-7.5 3.3z' />
                  <path d='m64.2 285.8c-2.9 0-5.7-1.3-7.6-3.7-10.6-13.7-16.3-30.7-16.2-48-.1-17.1 5.6-34.2 16.2-47.8 3.3-4.2 9.3-5 13.5-1.7s5 9.3 1.7 13.5c-8 10.3-12.3 23.1-12.2 36.1-.1 13.1 4.3 26 12.2 36.2 3.2 4.2 2.5 10.2-1.7 13.5-1.8 1.2-3.8 1.9-5.9 1.9z' />
                  <path d='m36.1 315.6c-2.7 0-5.4-1.1-7.3-3.3-18.8-21.8-29-49.5-28.8-78.3-.2-27.9 9.6-55.1 27.5-76.6 3.4-4.1 9.5-4.6 13.5-1.2 4.1 3.4 4.6 9.5 1.2 13.5-15.1 18-23.2 40.8-23.1 64.2-.2 24.2 8.4 47.4 24.1 65.6 3.5 4 3 10.1-1 13.6-1.6 1.7-3.9 2.5-6.1 2.5z' />
                </svg>
                {this.phone}
              </a>
            )}
            {this.email && (
              <a
                class='ContactListItem-email'
                href={`mailto:${atob(this.emailHref.split("mailto:")[1] || "")}`}
                target='_blank'
              >
                <svg
                  class='ContactListItem-emailIcon'
                  enable-background='new 0 0 500 500'
                  viewBox='0 0 500 500'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <g transform='translate(.5 .5)'>
                    <path d='m459.8 404.3h-420.6c-21.9 0-39.7-17.8-39.7-39.7v-230.1c0-21.9 17.8-39.7 39.7-39.7h420.6c21.9 0 39.7 17.8 39.7 39.7v230.1c0 21.9-17.8 39.7-39.7 39.7zm-420.6-285.8c-8.8 0-15.9 7.1-15.9 15.9v230.1c0 8.8 7.1 15.9 15.9 15.9h420.6c8.8 0 15.9-7.1 15.9-15.9v-230c0-8.8-7.1-15.9-15.9-15.9h-420.6z' />
                    <path d='m249.4 261.5c-6.6 0-13.1-1.5-19.1-4.5l-168-84.6c-5.9-3-8.2-10.1-5.3-16 3-5.9 10.1-8.2 16-5.3l168 84.6c5.3 2.6 11.7 2.6 17 0l168.1-84.6c5.8-2.9 13-.6 16 5.3s.6 13-5.3 16l-168.2 84.6c-6 3.1-12.6 4.5-19.2 4.5z' />
                  </g>
                </svg>
                {atob(this.email)}
              </a>
            )}
          </div>
        </div>
      </Host>
    );
  }
}
