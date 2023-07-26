import { Component, h, Prop, Host, Listen, Element, State, Watch } from "@stencil/core";
import { activateRippleAnimation, terminateRippleAnimation } from "../../../utils/utils";

const Fragment = (_props, children) => [...children];

@Component({
  tag: "app-button-primary",
  styleUrl: "button-primary.scss",
  shadow: true,
})
export class AppButtonPrimary {
  /**
   * The text displayed inside the button
   */
  @Prop() public text: string;

  /**
   * The name of the icon on the left side of the text.
   */
  @Prop() public iconLeft: string = "";

  /**
   * The name of the icon on the right side of the text.
   */
  @Prop() public iconRight: string = "";

  /**
   * Path to the svg-icon on the left side of the text.
   */
  @Prop() public iconLeftSrc?: string = "";

  /**
   * Path to the svg-icon on the right side of the text.
   */
  @Prop() public iconRightSrc?: string = "";

  /**
   * `true` if the button should be disabled
   */
  @Prop() public disabled?: boolean = false;

  /**
   * `true` if the button should be grey
   */
  @Prop() public grey?: boolean = false;

  /**
   * `true` if the button should be mixed, should only be used together with `inverted = true`
   */
  @Prop() public mixed?: boolean = false;

  /**
   * `true` if the button should be inverted (white instead of red)
   */
  @Prop() public inverted?: boolean = false;

  /**
   * `small` or `large` (default: `large`)
   */
  @Prop() public size: "large" | "small" = "large";

  /**
   * The url where the button-link should direct to
   */
  @Prop() public href?: string;

  /**
   * true, when the button should be rendered without an <a> or <button> tag
   */
  @Prop() public imitateButton?: boolean = false;

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

  @Element() private el: HTMLAppButtonPrimaryElement;
  private nativeAnchorElement: HTMLAnchorElement | HTMLButtonElement | HTMLSpanElement;

  private nativeElementBlur = () => {
    this.nativeAnchorElement.blur();
  };

  private handleClick = (event: MouseEvent) => {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }

    this.nativeElementBlur();
    activateRippleAnimation(event, this.inverted ? "solid" : "transparent");
  };

  private handleFocus = () => {
    if (this.disabled) {
      this.nativeElementBlur();
      return;
    }

    // When the component gets focus, pass focus to the first inner element.
    this.nativeAnchorElement.focus();
    // Then make tabindex -1 so that the component may still get focus, but does NOT accept tabbing.
    this._tabIndex = -1;
  };

  private handleBlur = () => {
    // As soon as user navigates away, then component may accept tabbing again.
    if (!this.disabled) {
      // As soon as user navigates away, then component may accept tabbing again.
      this._tabIndex = 0;
    }
  };

  private handleRippleEnd = (event: AnimationEvent) => {
    terminateRippleAnimation(event, this.inverted ? "solid" : "transparent");
  };

  private getRippleScaffold() {
    return (
      <div class='ripple-container' onAnimationEnd={this.handleRippleEnd}>
        <span class='ripple-circle'></span>
      </div>
    );
  }

  private renderText() {
    return <span class='text'>{this.text}</span>;
  }

  private renderLeftIcon() {
    return (
      <div>
        {this.iconLeft ? (
          <span
            class={`
                                    ButtonPrimary-icon
                                    ButtonPrimary-icon--left
                                    app-icon--${this.iconLeft}
                                `}
          />
        ) : null}
        {this.iconLeftSrc ? <img src={this.iconLeftSrc} class='left' /> : null}
      </div>
    );
  }

  private renderRightIcon() {
    return (
      <div>
        {this.iconRightSrc ? <img src={this.iconRightSrc} class='right' /> : null}
        {this.iconRight ? (
          <span
            class={`
                    ButtonPrimary-icon
                    ButtonPrimary-icon--right
                    app-icon--${this.iconRight}
                `}
          />
        ) : null}
      </div>
    );
  }

  private renderInnerContent() {
    return (
      <Fragment>
        {this.getRippleScaffold()}
        {this.renderLeftIcon()}
        {this.renderText()}
        {this.renderRightIcon()}
      </Fragment>
    );
  }

  render() {
    return (
      <Host
        class={`
                    ButtonPrimary
                    ${this.grey ? "ButtonPrimary--grey" : ""}
                    ${this.mixed ? "ButtonPrimary--mixed" : ""}
                    ${this.inverted ? "ButtonPrimary--inverted" : ""}
                    ${this.disabled ? "ButtonPrimary--disabled" : ""}
                    ${this.iconLeft || this.iconLeftSrc ? "ButtonPrimary--hasLeftIcon" : ""}
                    ${this.iconRight || this.iconRightSrc ? "ButtonPrimary--hasRightIcon" : ""}
                    ${this.size === "small" ? "small" : ""}
                `}
        tabindex={this._tabIndex}
        onfocus={this.handleFocus}
        onblur={this.handleBlur}
        focusable
      >
        {this.imitateButton ? (
          <span class='ButtonPrimary-button' ref={(el) => (this.nativeAnchorElement = el as HTMLSpanElement)}>
            {this.renderInnerContent()}
          </span>
        ) : this.href ? (
          <a
            class='ButtonPrimary-button'
            href={this.disabled ? null : this.href}
            target={this.disabled ? null : this.target}
            rel={this.target === "_blank" ? "noopener noreferrer" : null}
            onClick={this.handleClick}
            ref={(el) => (this.nativeAnchorElement = el as HTMLAnchorElement)}
          >
            {this.renderInnerContent()}
          </a>
        ) : (
          <button
            class='ButtonPrimary-button'
            type={this.type}
            onClick={this.handleClick}
            ref={(el) => (this.nativeAnchorElement = el as HTMLButtonElement)}
          >
            {this.renderInnerContent()}
          </button>
        )}
      </Host>
    );
  }
}
