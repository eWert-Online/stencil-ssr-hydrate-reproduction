import { Component, h, Prop, Host, Event, EventEmitter, State, Element, Watch, Method } from "@stencil/core";
import { getTopLabelTextWidth } from "../../utils/utils";

@Component({
  tag: "app-input-multiline",
  styleUrl: "input-multiline.scss",
  shadow: true,
})
export class AppInputMultiline {
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
   * The error text shown below the input field.
   */
  @Prop() public errorText?: string = "";

  /**
   * The hint text shown below the input field.
   * * Optional occurrence of `${link}` will be replaced by the value of `hintLinkText` upon rendering.
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
   * `true` if the inner text area should have a resize handle
   */
  @Prop() public resizable?: boolean = true;

  /**
   * Emitted after the input is changed when the focus is lost
   */
  @Event() private change: EventEmitter;

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
    this.nativeTextAreaElement?.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
  }

  @Element() private el: HTMLAppInputMultilineElement;
  @State() private hasTransparentBackground: boolean;
  @State() private borderGapWidth: number = 0;
  private _borderGapInitial: boolean = !!this.value;

  private get hasScrollbar(): boolean {
    if (!this.nativeTextAreaElement) {
      return false;
    }
    return this.nativeTextAreaElement.clientHeight < this.nativeTextAreaElement.scrollHeight;
  }

  @Watch("label")
  onLabelChange() {
    if (!this.labelSpanElement && this.label) {
      this.labelElObserver = new MutationObserver(() => {
        this.labelSpanElement = this.el.shadowRoot.querySelector(".InputMultiline-label");
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

  @Watch("disabled")
  checkIfDisabled() {
    this._tabIndex = this.disabled ? -1 : 0;
  }

  private nativeTextAreaElement: HTMLTextAreaElement;
  private inputWrapperElement: HTMLElement;
  private mutationObserver: MutationObserver;
  private labelElObserver: MutationObserver;
  private labelSpanElement: HTMLSpanElement;
  private isFocused: boolean = false;

  private handleInput = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;

    // stop bubbling of the event, as oninput is a composed event and thus will
    // cross the border of the shadow dom
    // this prevents the component from throwing the input event twice
    e.stopPropagation();

    this.value = target ? target.value : "";

    this.input.emit();
  };

  private handleChange = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    this.value = target ? target.value : "";

    this.change.emit();
  };

  private getBackgroundValue(): void {
    const parentNode = this.el.parentNode as HTMLElement;
    const backgroundColor = parentNode?.style?.backgroundColor;
    this.hasTransparentBackground = !backgroundColor || backgroundColor === "transparent";
  }

  private handleHostFocus = () => {
    if (this.disabled) {
      return;
    }

    // When the component gets focus, pass focus to the first inner element.
    this.nativeTextAreaElement.focus();
    this.isFocused = true;

    // Then make tabindex -1 so that the component may still get focus, but does NOT accept tabbing.
    this._tabIndex = -1;
  };

  private handleHostBlur = () => {
    this.nativeTextAreaElement.blur();
    this.isFocused = false;
    this.checkIfFilledOrFocused();

    // As soon as user navigates away, then component may accept tabbing again.
    if (!this.disabled) {
      // As soon as user navigates away, then component may accept tabbing again.
      this._tabIndex = 0;
    }
  };

  private moveLabelOnTop() {
    if (!this.label) {
      return;
    }

    var maxWidth: number;
    if (this.inputWrapperElement) {
      const { width: inputWrapperWidth } = this.inputWrapperElement.getBoundingClientRect();
      const { paddingLeft, paddingRight } = window.getComputedStyle(this.nativeTextAreaElement);
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
    this.mutationObserver = new MutationObserver(() => this.getBackgroundValue());
    this.mutationObserver.observe(parentNode, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }

  disconnectedCallback() {
    this.mutationObserver && this.mutationObserver.disconnect();
    this.labelElObserver && this.labelElObserver.disconnect();
  }

  private renderMultilineError() {
    return (this.invalid || this.warning || this.hasInformation) && this.errorText ? (
      <div class='InputMultiline-error'>
        <span>{this.errorText}</span>
      </div>
    ) : null;
  }

  private renderMultilineHint() {
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
      <div class='InputMultiline-hint'>
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
                    InputMultiline
                    ${this.disabled ? "is-disabled" : ""}
                    ${this.invalid ? "has-message-invalid" : ""}
                    ${this.label ? "has-label" : ""}
                    ${this.warning && !this.invalid ? "has-message-warning" : ""}
                    ${this.hasInformation && !this.invalid && !this.warning ? "has-message-info" : ""}
                    ${this.value ? "is-filled" : ""}
                    ${this.resizable ? "is-resizable" : ""}
                    ${this.hasTransparentBackground ? "has-transparent-background" : ""}
                `}
        onBlur={() => this.handleHostBlur()}
        onFocus={() => this.handleHostFocus()}
        tabindex={this._tabIndex}
        focusable
      >
        <div class='InputMultiline-outer-wrapper'>
          <label class='InputMultiline-wrapper' ref={(el) => (this.inputWrapperElement = el)}>
            <textarea
              class={`
                        InputMultiline-input
                        ${this.invalid ? "has-message-invalid" : ""}
                        ${this.warning && !this.invalid ? "has-message-warning" : ""}
                        ${this.hasInformation && !this.invalid && !this.warning ? "has-message-info" : ""}
                        ${this.hasScrollbar ? "has-scrollbar" : ""}
                        ${this.disabled ? "is-disabled" : ""}
                    `}
              name={this.name}
              disabled={this.disabled}
              value={this.value}
              maxLength={this.maxLength}
              minLength={this.minLength}
              required={this.required}
              onChange={this.handleChange}
              onInput={this.handleInput}
              ref={(el) => (this.nativeTextAreaElement = el as HTMLTextAreaElement)}
              onBlur={() => this.moveLabelToDefault()}
              onFocus={() => this.moveLabelOnTop()}
            >
              {this.value}
            </textarea>
            <div
              class={`InputMultiline-border-gap ${this._borderGapInitial ? "initial" : ""}`}
              style={{ width: `${this.borderGapWidth}px` }}
            ></div>
            {this.label && (
              <span class='InputMultiline-label' ref={(el) => (this.labelSpanElement = el as HTMLSpanElement)}>
                {this.label}
              </span>
            )}
            {this.invalid || this.warning ? <span class='InputMultiline-errorIcon' /> : null}
            {!this.invalid && !this.warning && this.hasInformation ? <span class='InputMultiline-infoIcon' /> : null}
          </label>
          {this.renderMultilineError()}
          {this.renderMultilineHint()}
        </div>
      </Host>
    );
  }
}
