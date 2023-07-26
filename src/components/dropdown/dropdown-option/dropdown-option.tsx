import { Component, Prop, h, Host, Listen } from "@stencil/core";

const Fragment = (_props, children) => [...children];

/**
 * Renders a dropdown option which is meant to be used as slotted content for <app-dropdown> element.
 */
@Component({
  tag: "app-dropdown-option",
  styleUrl: "dropdown-option.scss",
  shadow: true,
})
export class AppDropdownOption {
  /**
   * The label of the option
   */
  @Prop({ reflect: true }) public label: string;

  /**
   * The value of the option
   */
  @Prop({ reflect: true }) public value: string;

  /**
   * The name of the icon (optional)
   */
  @Prop({ reflect: true }) public icon?: string;

  /**
   * The path to the custom icon (optional)
   */
  @Prop({ reflect: true }) public iconSrc?: string;

  /**
   * Renders and optional checkbox when set to true
   */
  @Prop() public multiselect: boolean = false;

  /**
   * `true` if the option should be disabled
   */
  @Prop({ reflect: true }) public disabled: boolean = false;

  /**
   * `true` if the option should be selected.
   */
  @Prop() public selected: boolean = false;

  /**
   * `true` if the option is active
   */
  @Prop() public active: boolean = false;

  /**
   * `true` if the the dropdown options are grouped under subheadings
   */
  @Prop() public clustered: boolean = false;

  /**
   * `small` or `medium` (default: `medium`)
   */
  @Prop() public size: "medium" | "small" = "medium";

  private _renderIcon() {
    return (
      <Fragment>
        {this.icon && <span class={`icon app-icon--${this.icon}`} />}
        {this.iconSrc && <img class='icon icon-img' src={this.iconSrc} />}
      </Fragment>
    );
  }

  private _renderLabel() {
    return <span class='label'>{this.label}</span>;
  }

  // eslint-disable-next-line @stencil-community/prefer-vdom-listener
  @Listen("click")
  handleOptionClick(event: MouseEvent) {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  }

  render() {
    return (
      <Host
        class={`
                    ${this.selected ? "is-selected" : ""}
                    ${this.multiselect ? "is-multiselect" : ""}
                    ${this.active ? "is-active" : ""}
                    ${this.clustered ? "is-clustered" : ""}
                    ${this.disabled ? "is-disabled" : ""}
                    ${this.size === "medium" ? "size-medium" : "size-small"}
                `}
      >
        <div class={`option-wrapper ${this.size === "medium" ? "size-medium" : "size-small"}`}>
          {this.multiselect ? (
            <Fragment>
              <div>
                <div class='Dropdown-checkbox' />
                {this._renderLabel()}
              </div>

              {this._renderIcon()}
            </Fragment>
          ) : (
            <Fragment>
              {this._renderIcon()}
              {this._renderLabel()}
            </Fragment>
          )}
        </div>
      </Host>
    );
  }
}
