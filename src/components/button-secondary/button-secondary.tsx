import { Component, h, Prop, Host, Element, Listen, State, Watch } from "@stencil/core";

const Fragment = (_props, children) => [...children];

@Component({
  tag: "app-button-secondary",
  styleUrl: "button-secondary.scss",
  shadow: true,
})
export class AppButtonSecondary {
  /**
   * The text displayed inside the button
   */
  @Prop() public text: string;

  /**
   * `true` if the button should be disabled
   */
  @Prop() public disabled?: boolean = false;

  /**
   * The url where the button-link should direct to
   */
  @Prop() public href?: string;

  /**
   * true, when the button should be rendered without an <a> or <button> tag
   */
  @Prop() public imitateButton?: boolean;

  /**
   * The target of the button-link.
   * If this is '_blank', rel="noopener noreferrer" is added automatically.
   */
  @Prop() public target?: "_top" | "_parent" | "_blank" | "_self" = "_self";

  /**
   * The type of the button
   */
  @Prop() public type: "button" | "submit" | "reset" = "button";

  @State() _tabIndex: number = this.disabled ? -1 : 0;

  @Watch("disabled")
  checkIfDisabled() {
    this._tabIndex = this.disabled ? -1 : 0;
  }

  /* Implicit form submission when using ShadowDOM hack from https://www.hjorthhansen.dev/shadow-dom-and-forms/ */
  @Listen("click", { capture: false })
  onClick(event: Event) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }

    const form = this.el.closest("form");
    if (this.type === "submit" && form) {
      event.preventDefault();
      const fakeSubmit = document.createElement("button");
      fakeSubmit.type = "submit";
      fakeSubmit.style.display = "none";
      form.appendChild(fakeSubmit);
      fakeSubmit.click();
      fakeSubmit.remove();
    }
  }

  @Element() private el: HTMLAppButtonSecondaryElement;
  private nativeButtonElement: HTMLButtonElement;
  private nativeAnchorElement: HTMLAnchorElement;

  private nativeElementBlur = () => {
    if (this.nativeAnchorElement) {
      this.nativeAnchorElement.blur();
    } else if (this.nativeButtonElement) {
      this.nativeButtonElement.blur();
    }
  };

  private handleClick = (event: MouseEvent) => {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }

    this.nativeElementBlur();
  };

  private handleFocus = () => {
    if (this.disabled) {
      this.nativeElementBlur();
      return;
    }

    // When the component gets focus, pass focus to the first inner element.
    if (this.href) {
      this.nativeAnchorElement.focus();
    } else {
      this.nativeButtonElement.focus();
    }
    // Then make tabindex -1 so that the component may still get focus, but does NOT accept tabbing.
    this._tabIndex = -1;
  };

  private handleBlur = () => {
    if (!this.disabled) {
      // As soon as user navigates away, then component may accept tabbing again.
      this._tabIndex = 0;
    }
  };

  private renderText() {
    return <span class='text'>{this.text}</span>;
  }

  render() {
    return (
      <Host
        class={`
                    ButtonSecondary
                    ${this.disabled ? "ButtonSecondary--disabled" : ""}
                `}
        tabindex={this._tabIndex}
        onfocus={this.handleFocus}
        onblur={this.handleBlur}
        focusable
      >
        {this.imitateButton ? (
          <span class='ButtonSecondary-button' onClick={this.handleClick}>
            {this.renderText()}
          </span>
        ) : this.href ? (
          <a
            class='ButtonSecondary-button'
            href={this.disabled ? null : this.href}
            target={this.disabled ? null : this.target}
            rel={this.target === "_blank" ? "noopener noreferrer" : null}
            onClick={this.handleClick}
            ref={(el) => (this.nativeAnchorElement = el as HTMLAnchorElement)}
          >
            {this.renderText()}
          </a>
        ) : (
          <button
            class='ButtonSecondary-button'
            type={this.type}
            onClick={this.handleClick}
            ref={(el) => (this.nativeButtonElement = el as HTMLButtonElement)}
          >
            {this.renderText()}
          </button>
        )}
      </Host>
    );
  }
}
