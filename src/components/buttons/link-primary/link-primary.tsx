import { Component, h, Prop, Host, State, Watch } from "@stencil/core";

@Component({
  tag: "app-link-primary",
  styleUrl: "link-primary.scss",
  shadow: true,
})
export class AppLinkPrimary {
  /**
   * The text displayed inside the link
   */
  @Prop() public text: string;

  /**
   * The url where the link should direct to
   */
  @Prop() public href: string;

  /**
   * The target of the link.
   * If this is '_blank', rel="noopener noreferrer" is added automatically.
   */
  @Prop() public target: "_top" | "_parent" | "_blank" | "_self" = "_self";

  /**
   * The name of the icon on the left side of the text.
   * If not provided, no icon is displayed.
   */
  @Prop() public iconLeft: string = "";

  /**
   * The name of the icon on the right side of the text.
   * If not provided, no icon is displayed.
   */
  @Prop() public iconRight: string = "";

  /**
   * The size of the icon. S = 12px; M = 18px
   */
  @Prop() public iconSize?: "S" | "M" = "M";

  /**
   * `true` if the link should be disabled
   */
  @Prop() public disabled?: boolean = false;

  /**
   * `true` if the link should be grey
   */
  @Prop() public grey?: boolean = false;

  /**
   * The download attribute of the link
   */
  @Prop() public download?: string;

  /**
   * true, when the link should be rendered without an <a> tag
   */
  @Prop() public imitateLink?: boolean = false;

  private nativeAnchorElement: HTMLAnchorElement | HTMLSpanElement;

  @State() _tabIndex: number = this.disabled ? -1 : 0;

  @Watch("disabled")
  checkIfDisabled() {
    this._tabIndex = this.disabled ? -1 : 0;
  }

  private get leftIconVisible(): boolean {
    return this.iconLeft.length > 0;
  }

  private get rightIconVisible(): boolean {
    return this.iconRight.length > 0;
  }

  private handleClick = (event: MouseEvent) => {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  };

  private renderLeftIcon() {
    return (
      <div>
        {this.iconLeft ? (
          <span
            class={`
                        LinkPrimary-icon
                        LinkPrimary-icon--left
                        LinkPrimary-icon--${this.iconSize.toLowerCase()}
                        app-icon--${this.iconLeft}
                    `}
          />
        ) : null}
      </div>
    );
  }

  private renderRightIcon() {
    return (
      <div>
        {this.iconRight ? (
          <span
            class={`
                        LinkPrimary-icon
                        LinkPrimary-icon--right
                        LinkPrimary-icon--${this.iconSize.toLowerCase()}
                        app-icon--${this.iconRight}
                    `}
          />
        ) : null}
      </div>
    );
  }

  private renderText() {
    return <span class='LinkPrimary-text'>{this.text}</span>;
  }

  private handleHostFocus = () => {
    if (this.disabled) {
      return;
    }

    // When the component gets focus, pass focus to the first inner element.
    this.nativeAnchorElement.focus();
    // Then make tabindex -1 so that the component may still get focus, but does NOT accept tabbing.
    this._tabIndex = -1;
  };

  private handleHostBlur = () => {
    // As soon as user navigates away, then component may accept tabbing again.
    if (!this.disabled) {
      // As soon as user navigates away, then component may accept tabbing again.
      this._tabIndex = 0;
    }
  };

  render() {
    return (
      <Host
        class={`
                    LinkPrimary
                    ${this.grey ? "LinkPrimary--grey" : ""}
                    ${this.disabled ? "LinkPrimary--disabled" : ""}
                `}
        tabindex={this._tabIndex}
        onfocus={this.handleHostFocus}
        onblur={this.handleHostBlur}
        focusable
      >
        {this.imitateLink ? (
          <span class='LinkPrimary-link' ref={(el) => (this.nativeAnchorElement = el as HTMLSpanElement)}>
            {this.renderLeftIcon()}
            {this.renderText()}
            {this.renderRightIcon()}
          </span>
        ) : (
          <a
            class='LinkPrimary-link'
            href={this.disabled ? null : this.href}
            target={this.disabled ? null : this.target}
            rel={this.target === "_blank" ? "noopener noreferrer" : null}
            ref={(el) => (this.nativeAnchorElement = el as HTMLAnchorElement)}
            download={this.download}
            onClick={this.handleClick}
          >
            {this.renderLeftIcon()}
            {this.renderText()}
            {this.renderRightIcon()}
          </a>
        )}
      </Host>
    );
  }
}
