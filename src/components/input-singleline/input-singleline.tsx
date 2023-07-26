import { Component, h, Prop, Host, Event, EventEmitter, Element, State, Watch, Method, Listen } from "@stencil/core";
import { getTopLabelTextWidth } from "../../utils/utils";

@Component({
  tag: "app-input-singleline",
  styleUrl: "input-singleline.scss",
  shadow: true,
})
export class AppInputSingleline {
  /**
   * The type of the input.
   * If you don't find your desired type, there may be another component for that.
   * Defaults to "text"
   */
  @Prop({ reflect: true }) public type?: "text" | "password" | "tel" | "url" | "email" | "number" = "text";

  /**
   * Whether an show | hide password toggle is rendered.
   * The property is ignored for input types other than 'password'.
   */
  @Prop() public showPasswordEyeToggle: boolean = true;

  /**
   * The label of the input
   */
  @Prop() public label!: string;

  /**
   * The name of the input
   */
  @Prop() public name!: string;

  /**
   * The value of the input
   */
  @Prop({ mutable: true }) public value: string = "";

  /**
   * The maximum number of characters the user is allowed to type
   * into this input.
   */
  @Prop() public maxLength?: number;

  /**
   * The minimum number of characters the user is allowed to type
   * into this input.
   */
  @Prop() public minLength?: number;

  @Element() private el: HTMLAppInputSinglelineElement;
  @State() private hasTransparentBackground: boolean;
  @State() private borderGapWidth: number = 0;

  private _borderGapInitial: boolean = !!this.value;
  private parentNodeMutationObserver: MutationObserver;
  private labelElObserver: MutationObserver;
  private nativeInputElement: HTMLInputElement;
  private inputWrapperElement: HTMLElement;
  private labelSpanElement: HTMLSpanElement;
  private isFocused: boolean = false;

  /**
   * The minimum value the user is allowed to type into the input, used with input[type=number]
   */
  @Prop() public min?: any;

  /**
   *  The maximum value the user is allowed to type into the input, used with input[type=number]
   */
  @Prop() public max?: any;

  /**
   *  The step attribute specifies the interval between legal numbers in an input, used with input[type=number]
   */
  @Prop() public step?: number;

  /**
   *  The pattern attribute allows validation of an input field based on a given regular expression pattern.
   */
  @Prop() public pattern?: any;

  /**
   * The auto-complete property of the input field.
   * This tells the browser, what he should suggest for this input.
   */
  @Prop({ attribute: "autocomplete" }) public autoComplete?: string;

  /**
   * `true` if the input field has error validation state.
   * This should always be used in combination with an error-text
   */
  @Prop() public invalid?: boolean = false;

  /**
   * `true` if the input field has warning validation state.
   * This should always be used in combination with an error-text
   * When multiple validation states are set to true (`invalid`, `warning`, `hasInfo`), the `invalid` state takes precedence.
   */
  @Prop() public warning?: boolean = false;

  /**
   * `true` if the input field has information validation state.
   * This should always be used in combination with an error-text
   * When both `hasInfo` and `warning` are true, the `warning` state takes precedence.
   */
  @Prop() public hasInformation?: boolean = false;

  /**
   * 'true' will hide the up/down arrows rendered by browsers on numeric inputs
   */
  @Prop() public hideArrows?: boolean = false;

  /**
   * The error text shown below the input field.
   */
  @Prop() public errorText?: string = "";

  /**
   * The hint text shown below the input field.
   * Optional occurrence of `${link}` will be replaced by the value of `hintLinkText` upon rendering.
   */
  @Prop() hint!: string;

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
   * `true` if the button should be disabled
   */
  @Prop() public disabled?: boolean = false;

  /**
   * `true` if the input field is required
   */
  @Prop() public required?: boolean = false;

  /**
   * Emitted after the input is changed when the focus is lost
   */
  @Event() private change: EventEmitter;

  /**
   * `small` or `large` (default: `large`)
   */
  @Prop() public size: "large" | "small" = "large";

  /**
   * Emitted as soon as the input is changed
   */
  @Event() private input: EventEmitter;

  /**
   * Sets the start and end positions of the current text selection for the inner input element.
   */
  @Method()
  public async setSelectionRange(
    selectionStart: number,
    selectionEnd: number,
    selectionDirection: "forward" | "backward" | "none" = "none",
  ) {
    this.nativeInputElement?.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
  }

  @Watch("label")
  onLabelChange() {
    if (!this.labelSpanElement && this.label) {
      this.labelElObserver = new MutationObserver(() => {
        this.labelSpanElement = this.el.shadowRoot.querySelector(".InputSingleline-label");
        if (this.labelSpanElement) {
          this.checkIfFilledOrFocused();
          this.labelElObserver.disconnect();
        }
      });
      this.labelElObserver.observe(this.inputWrapperElement, {
        childList: true,
      });
    } else {
      this.checkIfFilledOrFocused();
    }
  }

  @Watch("value")
  checkIfFilledOrFocused() {
    if (!this.inputWrapperElement) {
      return;
    }

    if (this.label && (this.value || this.isFocused)) {
      this.moveLabelOnTop();
    } else {
      this.moveLabelToDefault();
    }
  }

  @State() _tabIndex: number = this.disabled ? -1 : 0;
  @State() _showPassword: boolean = true;

  @Watch("disabled")
  checkIfDisabled() {
    this._tabIndex = this.disabled ? -1 : 0;
  }

  private handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.value = target ? target.value : "";

    this.change.emit(this.value);
  };

  private handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;

    // stop bubbling of the event, as oninput is a composed event and thus will
    // cross the border of the shadow dom
    // this prevents the component from throwing the input event twice
    e.stopPropagation();

    this.value = target ? target.value : "";

    this.input.emit(this.value);
  };

  private getBackgroundValue(): void {
    const parentNode = this.el.parentNode as HTMLElement;
    const backgroundColor = parentNode?.style?.backgroundColor;
    this.hasTransparentBackground = !backgroundColor || backgroundColor === "transparent";
  }

  private _isTabKeyNavigation = false;

  private handleHostFocus = () => {
    if (this.disabled) {
      return;
    }

    const startSelectionIndex = this._isTabKeyNavigation ? 0 : this.value?.length;
    this.nativeInputElement.setSelectionRange(startSelectionIndex, this.value?.length);

    // When the component gets focus, pass focus to the first inner element.
    this.nativeInputElement.focus();
    this.isFocused = true;

    // Then make tabindex -1 so that the component may still get focus, but does NOT accept tabbing.
    this._tabIndex = -1;
  };

  private handleHostBlur = () => {
    this.nativeInputElement.blur();
    this.isFocused = false;
    this.checkIfFilledOrFocused();

    // As soon as user navigates away, then component may accept tabbing again.
    if (!this.disabled) {
      // As soon as user navigates away, then component may accept tabbing again.
      this._tabIndex = 0;
    }
  };

  @Listen("keydown", { capture: true, target: "window" })
  _handleHostKeyDown($event: KeyboardEvent) {
    if ($event.key === "Tab") {
      this._isTabKeyNavigation = true;
    }
  }

  @Listen("keyup", { capture: true, target: "window" })
  _handleHostKeyUp() {
    this._isTabKeyNavigation = false;
  }

  private moveLabelOnTop() {
    if (!this.label) {
      return;
    }

    var maxWidth: number;
    if (this.inputWrapperElement) {
      const { width: inputWrapperWidth } = this.inputWrapperElement.getBoundingClientRect();
      const { paddingLeft, paddingRight } = window.getComputedStyle(this.nativeInputElement);
      maxWidth = inputWrapperWidth - parseInt(paddingLeft) - parseInt(paddingRight) - 2;
    } else {
      maxWidth = 0;
    }

    this.borderGapWidth = getTopLabelTextWidth(this.labelSpanElement, this.label, maxWidth);
  }

  private moveLabelToDefault() {
    if (!this.value || !this.label) {
      this.borderGapWidth = 0;
    }
  }

  async componentWillLoad() {
    await (document as any).fonts.ready;
  }

  componentDidRender() {
    if (this._borderGapInitial && this.borderGapWidth > 0) {
      this._borderGapInitial = false;
    }
  }

  componentDidLoad() {
    const { parentNode } = this.el;
    if (!parentNode) {
      return;
    }

    if (this.value) {
      (document as any).fonts.ready.then(() => this.moveLabelOnTop());
    }

    this.getBackgroundValue();
    this.parentNodeMutationObserver = new MutationObserver(() => this.getBackgroundValue());
    this.parentNodeMutationObserver.observe(parentNode, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }

  disconnectedCallback() {
    this.parentNodeMutationObserver && this.parentNodeMutationObserver.disconnect();
    this.labelElObserver && this.labelElObserver.disconnect();
  }

  private get _isPasswordField(): boolean {
    return this.type === "password";
  }

  private get _shouldRenderEyeToggle(): boolean {
    return this._isPasswordField && this.showPasswordEyeToggle;
  }

  private get _nativeInputType(): string {
    if (!this._isPasswordField) {
      return this.type;
    } else {
      return this._showPassword ? "password" : "text";
    }
  }

  private renderInfoIcon() {
    if (this._shouldRenderEyeToggle) {
      return;
    }
    return !this.invalid && !this.warning && this.hasInformation ? <span class='InputSingleline-infoIcon' /> : null;
  }

  private renderErrorIcon() {
    if (this._shouldRenderEyeToggle) {
      return;
    }
    return this.invalid || this.warning ? <span class='InputSingleline-errorIcon' /> : null;
  }

  private renderSinglelineError() {
    return (this.invalid || this.warning || this.hasInformation) && this.errorText ? (
      <div class='InputSingleline-error'>
        <span>{this.errorText}</span>
      </div>
    ) : null;
  }

  private renderSinglelineHint() {
    const { hint, hintLinkHref, hintLinkText, _isPasswordField } = this;
    if (!hint || _isPasswordField) {
      return;
    }

    const linkPlacholderLiteral = "${link}";

    const linkPlaceholderIndex = hint.indexOf(linkPlacholderLiteral);
    const placeholderFound = linkPlaceholderIndex > -1;
    const leftHintText = hint.substring(0, linkPlaceholderIndex);
    const rightHintText = placeholderFound ? hint.substring(linkPlaceholderIndex + linkPlacholderLiteral.length) : hint;

    return (
      <div class='InputSingleline-hint'>
        <span>
          {leftHintText}
          {this.hintLinkHref && placeholderFound && <a href={hintLinkHref}>{hintLinkText}</a>}
          {rightHintText}
        </span>
      </div>
    );
  }

  private renderPasswordEye() {
    if (this.disabled) {
      return;
    }
    return this._shouldRenderEyeToggle ? (
      <span
        onClick={() => (this._showPassword = !this._showPassword)}
        class={`InputSingleline-password-eye ${
          this._showPassword ? "InputSingleline-show-password-eye" : "InputSingleline-hide-password-eye"
        }`}
      />
    ) : null;
  }

  render() {
    return (
      <Host
        class={`
                    InputSingleline
                    ${this.disabled ? "is-disabled" : ""}
                    ${this.label ? "has-label" : ""}
                    ${this.invalid ? "has-message-invalid" : ""}
                    ${this.warning && !this.invalid ? "has-message-warning" : ""}
                    ${this.hasInformation && !this.invalid && !this.warning ? "has-message-info" : ""}
                    ${this._showPassword ? "show-password-eye" : ""}
                    ${this.value ? "is-filled" : ""}
                    ${this.size === "large" ? "size-large" : "size-small"}
                    ${this.hasTransparentBackground ? "has-transparent-background" : ""}
                `}
        onBlur={() => this.handleHostBlur()}
        onFocus={() => this.handleHostFocus()}
        tabindex={this._tabIndex}
        focusable
      >
        <label class='InputSingleline-wrapper' ref={(el) => (this.inputWrapperElement = el)}>
          <input
            class={`
                            InputSingleline-input
                            ${this.size === "large" ? "size-large" : "size-small"}
                            ${this.invalid ? "has-message-invalid" : ""}
                            ${this.warning && !this.invalid ? "has-message-warning" : ""}
                            ${this.hasInformation && !this.invalid && !this.warning ? "has-message-info" : ""}
                            ${this._isPasswordField ? "is-password-field" : ""}
                            ${this._nativeInputType === "number" && this.hideArrows === true ? "has-arrows-hidden" : ""}
                            ${this.disabled ? "is-disabled" : ""}
                        `}
            type={this._nativeInputType}
            name={this.name}
            disabled={this.disabled}
            maxLength={this.maxLength}
            minLength={this.minLength}
            required={this.required}
            min={this.min}
            max={this.max}
            step={this.step}
            pattern={this.pattern}
            value={this.value}
            autoComplete={this.autoComplete}
            onChange={this.handleChange}
            onInput={this.handleInput}
            ref={(el) => (this.nativeInputElement = el as HTMLInputElement)}
            onBlur={() => this.moveLabelToDefault()}
            onFocus={() => this.moveLabelOnTop()}
          />
          <div
            class={`InputSingleline-border-gap ${this._borderGapInitial ? "initial" : ""}`}
            style={{ width: `${this.borderGapWidth}px` }}
          ></div>
          {this.label && (
            <span class='InputSingleline-label' ref={(el) => (this.labelSpanElement = el as HTMLSpanElement)}>
              {this.label}
            </span>
          )}
          {this.renderErrorIcon()}
          {this.renderInfoIcon()}
          {this.renderPasswordEye()}
        </label>
        {this.renderSinglelineError()}
        {this.renderSinglelineHint()}
      </Host>
    );
  }
}
