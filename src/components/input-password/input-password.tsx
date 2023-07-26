import { h, Component, Prop, State, Event, EventEmitter, Listen } from "@stencil/core";

/**
 * Renders a password input form control element typically used for password-reset | registration flows.
 * The components wraps an inner <app-input-singleline type="password"> element and renders a warn text
 * under the input while CAPSLOCK is active.
 * It also has the posibility to list the password rules under the password input.
 *
 * @slot *default* - A list of <app-password-policy-rule> to display below the password-input
 */
@Component({
  tag: "app-password-input",
  styleUrl: "input-password.scss",
  shadow: true,
})
export class AppInputPassword {
  /**
   * The name of the password input
   */
  @Prop() public name!: string;

  /**
   * The hint text shown below the input field.
   */
  @Prop() hint!: string;

  /**
   * The label of the password input
   */
  @Prop() public label!: string;

  /**
   * The value of the input
   */
  @Prop() public value: string = "";

  /**
   * Text to be rendered as a hint when the keyboard CAPSLOCK is active
   */
  @Prop() public capsLockHint: string;

  /**
   * `true` if the password input should be disabled
   */
  @Prop() public disabled?: boolean = false;

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
   * `small` or `large` (default: `large`)
   */
  @Prop() public size: "large" | "small" = "large";

  /**
   * `true` if the input field is required
   */
  @Prop() public required?: boolean = false;

  /**
   * Emitted as soon as the input is changed
   */
  @Event() input: EventEmitter;

  /**
   * Emitted after the input is changed when the focus is lost
   */
  @Event() change: EventEmitter;

  /**
   * The auto-complete property of the input field.
   * This tells the browser, what he should suggest for this input.
   */
  @Prop({ attribute: "autocomplete" }) public autoComplete?: string;

  @State() private _capsLockOn: boolean = false;

  @Listen("keyup", { target: "document" })
  @Listen("mousedown", { target: "document" })
  _checkCapsLock(evt: KeyboardEvent) {
    this._capsLockOn = evt.getModifierState("CapsLock");
  }

  render() {
    return (
      <host>
        <app-input-singleline
          disabled={this.disabled}
          type='password'
          value={this.value}
          name={this.name}
          label={this.label}
          invalid={this.invalid}
          warning={this.warning}
          hasInformation={this.hasInformation}
          errorText={this.errorText}
          hint={this.hint}
          size={this.size}
          required={this.required}
          onInput={($evt) => (this.value = $evt.detail)}
        ></app-input-singleline>
        {this._capsLockOn && <span class='capslock-hint'>{this.capsLockHint}</span>}
        <slot></slot>
      </host>
    );
  }
}
