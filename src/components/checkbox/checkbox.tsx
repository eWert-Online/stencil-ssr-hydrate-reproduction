import { Component, h, Prop, Host, Event, EventEmitter, State, Watch, Element } from "@stencil/core";
import ResizeObserver from "resize-observer-polyfill";
import whatInput from "what-input";
/**
 * Renders a checkbox form control.
 * The default text font-styles (font-family, font-style, font-size, line-height) can be overriden using SCSS.
 * The size of the checkbox adapts to the general fontsize.
 * It is recommended to use the canonical App `fontsize-*` mixins from `fonts.scss`
 * module whenever overriding the font policies is needed.
 * The default form-control max-width can be overriden using CSS.
 * Both the checkbox text and the optional validation | hint texts rendered below the checkbox will wrap according to the max-width policy.
 *
 * @slot *default* - HTML-Content to be displayed within the checkbox
 */
@Component({
  tag: "app-checkbox",
  styleUrl: "checkbox.scss",
  shadow: true,
})
export class AppCheckbox {
  /**
   * The name of the input
   */
  @Prop() public name!: string;

  /**
   * The if the checkbox should be checked or not
   */
  @Prop({ mutable: true }) public checked: boolean = false;

  /**
   * While the indeterminate property of the checkbox is true,
   * it will render as indeterminate regardless of the checked value.
   * Any interaction with the checkbox by a user (i.e., clicking) will remove the indeterminate state.
   */
  @Prop({ mutable: true }) public indeterminate?: boolean = false;

  /**
   * `true` if the checkbox field has error validation state.
   * This should always be used in combination with an error-text
   */
  @Prop() public invalid?: boolean = false;

  /**
   * `true` if the checkbox field has warning validation state.
   * This should always be used in combination with an error-text
   * When multiple validation states are set to true (`invalid`, `warning`, `hasInfo`), the `invalid` state takes precedence.
   */
  @Prop() public warning?: boolean = false;

  /**
   * `true` if the checkbox field has information validation state.
   * This should always be used in combination with an error-text
   * When both `hasInfo` and `warning` are true, the `warning` state takes precedence.
   */
  @Prop() public hasInformation?: boolean = false;

  /**
   * The error text shown below the checkbox field.
   */
  @Prop() public errorText?: string = "";

  /**
   * The hint text shown below the checkbox field.
   * Optional occurrence of `${link}` will be replaced by the value of `hintLinkText` upon rendering.
   */
  @Prop() hint?: string = "";

  /**
   * Href for optional hyperlink rendered within the hint text.
   *  Works together with `hintLinkText`.
   */
  @Prop() hintLinkHref?: string = "";

  /**
   * Hyperlink text for optional link rendered within the hint text.
   * Works together with `hintLinkHref`.
   */
  @Prop() hintLinkText: string = this.hintLinkHref;

  /**
   * `true` if the checkbox should be disabled
   */
  @Prop() public disabled?: boolean = false;

  /**
   * `true` if the input field is required
   */
  @Prop() public required?: boolean = false;

  /**
   * Emitted with the event, as soon as the checkbox checked value changes.
   * @deprecated Use `change` instead of `stChange`
   */
  @Event() private stChange: EventEmitter<boolean>;

  /**
   * Emitted with the event, as soon as the checkbox checked value changes.
   */
  @Event() private change: EventEmitter<boolean>;

  private handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;

    const newCheckedState = target ? target.checked : false;

    if (this.checked !== newCheckedState) {
      this.checked = newCheckedState;
      this.stChange.emit(this.checked);
      this.change.emit(this.checked);
    }
  };

  @State() _tabIndex: number = this.disabled ? -1 : 0;

  @Watch("disabled")
  checkIfDisabled() {
    this._tabIndex = this.disabled ? -1 : 0;
  }

  @Watch("indeterminate")
  reflectIndeterminateStateOnNativeInput() {
    this.nativeInputElement.indeterminate = this.indeterminate;
  }

  @Watch("checked")
  onCheckedChange() {
    this.indeterminate = false;
    if (this._isUserInputMouseDriven()) {
      this._el.blur();
    }
  }

  private nativeInputElement: HTMLInputElement;

  private handleFocus = () => {
    if (this.disabled) {
      return;
    }

    // Focus occurs during when checking / unchecking via mouse click, yet it is not intended.
    // Focusing is only intentended via keyboard (tab | shift + tab)
    if (this._isUserInputMouseDriven()) {
      // Focus event is not cancellable, the inner native input will get cancelled so it needs to be blurred explictly.
      this._el.blur();
      return;
    }

    // When the component gets focus, pass focus to the first inner element.
    this.nativeInputElement.focus();
    // Then make tabindex -1 so that the component may still get focus, but does NOT accept tabbing.
    this._tabIndex = -1;
  };

  private handleBlur = () => {
    this.nativeInputElement.blur();

    // As soon as user navigates away, then component may accept tabbing again.
    if (!this.disabled) {
      // As soon as user navigates away, then component may accept tabbing again.
      this._tabIndex = 0;
    }
  };

  private _isUserInputMouseDriven() {
    // Focus event API doesn't provide any reliable and clean means for making the distinction
    // between keyboard and mouse driven focus events.
    return whatInput.ask() === "mouse";
  }

  private _checkboxResizeObserver: ResizeObserver;
  private _checkIconElement: HTMLSpanElement;
  @State() private _checkboxStyleProps: { padding: string; marginTop: string };
  @Element() private _el: HTMLAppCheckboxElement;

  private get _getCheckboxStyle(): { [key: string]: string } {
    if (!this._checkboxStyleProps) {
      return;
    }
    return {
      ...this._checkboxStyleProps,
    };
  }

  private _calculateCheckboxStyles() {
    const padding = `${this._checkIconElement?.clientHeight * 0.2}px`;
    const computedStyles = window.getComputedStyle(this._el);
    const textElFontSize = computedStyles.fontSize;
    const textElLineHeight = computedStyles.lineHeight;
    const marginTop = `${(parseInt(textElLineHeight) - parseInt(textElFontSize)) / 2}px`;
    return { padding, marginTop };
  }

  private _initializeCheckboxResizeObserver() {
    this._checkboxResizeObserver = new ResizeObserver(() => {
      this._checkboxStyleProps = this._calculateCheckboxStyles();
    });
    this._checkboxStyleProps = this._calculateCheckboxStyles();
    this._checkboxResizeObserver.observe(this._checkIconElement);
  }

  componentDidLoad() {
    this._initializeCheckboxResizeObserver();
    this.nativeInputElement.indeterminate = this.indeterminate;
  }

  connectedCallback() {
    if (this._checkIconElement) {
      this._initializeCheckboxResizeObserver();
    }
  }

  disconnectedCallback() {
    this._checkboxResizeObserver?.disconnect();
  }

  private _renderCheckboxError() {
    return this.errorText ? (
      <div class='Checkbox-error'>
        <span class='Checkbox-errorIcon' /> {this.errorText}
      </div>
    ) : null;
  }

  private _renderCheckboxHint() {
    const { hint, hintLinkHref, hintLinkText } = this;
    if (!hint) {
      return;
    }

    const linkPlacholderLiteral = "${link}";

    const linkPlaceholderIndex = hint.indexOf(linkPlacholderLiteral);
    const placeholderFound = linkPlaceholderIndex > -1;
    const leftHintText = hint.substring(0, linkPlaceholderIndex);
    const rightHintText = placeholderFound ? hint.substring(linkPlaceholderIndex + linkPlacholderLiteral.length) : hint;
    return hint ? (
      <div class='Checkbox-hint'>
        <span>
          {leftHintText}
          {this.hintLinkHref && placeholderFound && <a href={hintLinkHref}>{hintLinkText}</a>}
          {rightHintText}
        </span>
      </div>
    ) : null;
  }

  render() {
    return (
      <Host
        class={`
                    Checkbox
                    ${this.disabled ? "is-disabled" : ""}
                    ${this.invalid ? "has-message-invalid" : ""}
                    ${this.warning && !this.invalid ? "has-message-warning" : ""}
                    ${this.hasInformation && !this.invalid && !this.warning ? "has-message-info" : ""}
                    ${this.checked ? "is-checked" : ""}
                    ${this.indeterminate ? "is-indeterminate" : ""}
                `}
        tabindex={this._tabIndex}
        onfocus={this.handleFocus}
        onblur={this.handleBlur}
        focusable
      >
        <label class='Checkbox-label'>
          <input
            class='Checkbox-input'
            type='checkbox'
            id={this.name}
            disabled={this.disabled}
            required={this.required}
            name={this.name}
            checked={this.checked}
            indeterminate={this.indeterminate}
            onChange={this.handleChange}
            ref={(el) => (this.nativeInputElement = el as HTMLInputElement)}
          />
          <span class='Checkbox-box' style={this._getCheckboxStyle}>
            <span class='Checkbox-icon' ref={(el) => (this._checkIconElement = el as HTMLSpanElement)} />
          </span>
          <div class='Checkbox-info'>
            <span class='Checkbox-text'>
              <slot />
            </span>
          </div>
        </label>
        {this._renderCheckboxError()}
        {this._renderCheckboxHint()}
      </Host>
    );
  }
}
