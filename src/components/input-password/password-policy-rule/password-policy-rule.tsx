import { h, Component, Prop, Host } from "@stencil/core";

/**
 * Renders a single password policy rule which consists of a status icon on the left and the rule text on the right.
 * Both the icon and the text is styled to diffentiate between the valid and invalid state of the rule.
 */

@Component({
  tag: "app-password-policy-rule",
  styleUrl: "password-policy-rule.scss",
  shadow: true,
})
export class AppPasswordPolicyRule {
  /**
   * Password policy text
   */
  @Prop() public ruleText: string;

  /**
   * Whether the given password rule has been met or not
   */
  @Prop() isRuleValid: boolean;

  render() {
    return (
      <Host class={`${this.isRuleValid ? "rule-valid" : "rule-invalid"}`}>
        <span class='icon'></span>
        <span class='text'>{this.ruleText}</span>
      </Host>
    );
  }
}
