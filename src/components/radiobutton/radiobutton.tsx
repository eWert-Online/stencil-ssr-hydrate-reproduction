import { Component, h, Prop, Host, Event, EventEmitter, State, Watch, Element } from "@stencil/core";
import ResizeObserver from "resize-observer-polyfill";
import whatInput from "what-input";

/**
 * Renders a radiobutton form control.
 * The default text font-styles (font-family, font-style, font-size, line-height) can be overriden using SCSS.
 * It is recommended to use the canonical App `fontsize-*` mixins from `fonts.scss`
 * module whenever overriding the font policies is needed.
 * The default form-control max-width can be overriden using CSS.
 * Both the radiobutton text and the optional validation | hint texts rendered below
 * the radiobutton will wrap according to the max-width policy
 *
 * @slot *default* - HTML-Content to be displayed within the radiobutton
 */
@Component({
  tag: "app-radiobutton",
  styleUrl: "radiobutton.scss",
  shadow: true,
})
export class AppRadiobutton {
  /**
   * The name of the input
   */
  @Prop() public name!: string;

  /**
   * The if the radiobutton should be checked or not
   */
  @Prop({ mutable: true }) public checked: boolean = false;

  /**
   * `true` if the radiobutton field has error validation state.
   * This should always be used in combination with an error-text
   */
  @Prop() public invalid?: boolean = false;

  /**
   * `true` if the radiobutton field has warning validation state.
   * This should always be used in combination with an error-text
   * When multiple validation states are set to true (`invalid`, `warning`, `hasInfo`), the `invalid` state takes precedence.
   */
  @Prop() public warning?: boolean = false;

  /**
   * `true` if the radiobutton field has information validation state.
   * This should always be used in combination with an error-text
   * When both `hasInfo` and `warning` are true, the `warning` state takes precedence.
   */
  @Prop() public hasInformation?: boolean = false;

  /**
   * The error text shown below the radiobutton field.
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
   * `true` if the radiobutton should be disabled
   */
  @Prop() public disabled?: boolean = false;

  /**
   * `true` if the input field is required
   */
  @Prop() public required?: boolean = false;

  /**
   * Emitted with the event, as soon as the radiobutton checked value changes.
   * @deprecated Use `change` instead of `stChange`
   */
  @Event() private stChange: EventEmitter<boolean>;

  /**
   * Emitted with the event, as soon as the radiobutton checked value changes.
   */
  @Event() private change: EventEmitter<boolean>;
  @Element() private _el: HTMLAppRadiobuttonElement;

  private handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.checked = target ? target.checked : false;

    this.stChange.emit(this.checked);
    this.change.emit(this.checked);
  };

  @State() _tabIndex: number = this.disabled ? -1 : 0;

  @Watch("disabled")
  checkIfDisabled() {
    this._tabIndex = this.disabled ? -1 : 0;
  }

  @Watch("checked")
  onCheckedChange() {
    if (this._isUserInputMouseDriven()) {
      this._el.blur();
    }
  }

  private _isUserInputMouseDriven() {
    // Focus event API doesn't provide any reliable and clean means for making the distinction
    // between keyboard and mouse driven focus events.
    return whatInput.ask() === "mouse";
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

  private _radioButtonResizeObserver: ResizeObserver;

  @State() private _radioButtonIconStyleProps: {
    width: string;
    height: string;
    marginTop: string;
  };

  private get _getRadioButtonIconStyle(): { [key: string]: string } {
    if (!this._radioButtonIconStyleProps) {
      return;
    }
    return {
      ...this._radioButtonIconStyleProps,
    };
  }

  private _calculateRadioButtonIconStyles() {
    const computedStyles = window.getComputedStyle(this._el);
    const textElFontSize = computedStyles.fontSize;
    const textElLineHeight = computedStyles.lineHeight;
    const marginTop = (parseInt(textElLineHeight) - parseInt(textElFontSize)) / 2;

    return {
      width: textElFontSize,
      height: textElFontSize,
      marginTop: `${marginTop}px`,
    };
  }

  private _initializeRadioButtonResizeObserver() {
    this._radioButtonResizeObserver = new ResizeObserver(() => {
      this._radioButtonIconStyleProps = this._calculateRadioButtonIconStyles();
    });
    this._radioButtonIconStyleProps = this._calculateRadioButtonIconStyles();
    this._radioButtonResizeObserver.observe(this.nativeInputElement);
  }

  componentDidLoad() {
    this._initializeRadioButtonResizeObserver();
  }

  connectedCallback() {
    if (this.nativeInputElement) {
      this._initializeRadioButtonResizeObserver();
    }
  }

  disconnectedCallback() {
    this._radioButtonResizeObserver?.disconnect();
  }

  private _renderRadiobuttonError() {
    return this.errorText ? (
      <div class='Radiobutton-error'>
        <span class='Radiobutton-errorIcon' /> {this.errorText}
      </div>
    ) : null;
  }

  private _renderRadiobuttonHint() {
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
      <div class='Radiobutton-hint'>
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
                    Radiobutton
                    ${this.disabled ? "is-disabled" : ""}
                    ${this.invalid ? "has-message-invalid" : ""}
                    ${this.warning && !this.invalid ? "has-message-warning" : ""}
                    ${this.hasInformation && !this.invalid && !this.warning ? "has-message-info" : ""}
                    ${this.checked ? "is-checked" : ""}
                `}
        tabindex={this._tabIndex}
        onfocus={this.handleFocus}
        onblur={this.handleBlur}
        focusable
      >
        <label class='Radiobutton-label'>
          <input
            class='Radiobutton-input'
            type='radio'
            id={this.name}
            disabled={this.disabled}
            name={this.name}
            checked={this.checked}
            required={this.required}
            onChange={this.handleChange}
            ref={(el) => (this.nativeInputElement = el as HTMLInputElement)}
          />
          <svg
            version='1.1'
            id='icon_circle-check'
            width='16px'
            height='16px'
            viewBox='0 0 500 500'
            class='Radiobutton-box'
            style={this._getRadioButtonIconStyle}
          >
            <g>
              <circle
                class='Radiobutton-outercircle'
                cx='250'
                cy='250'
                stroke-width={this.invalid ? 45 : 25}
                r={this.invalid ? 220 : 225}
              />
              <circle class='Radiobutton-innercircle' cx='250' cy='250' r='150' stroke-width='0' />
            </g>
          </svg>
          <div class='Radiobutton-info'>
            <span class='Radiobutton-text'>
              <slot />
            </span>
          </div>
        </label>
        {this._renderRadiobuttonError()}
        {this._renderRadiobuttonHint()}
      </Host>
    );
  }
}
