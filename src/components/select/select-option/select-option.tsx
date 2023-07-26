import { Component, Host, h, Prop, Method, State } from "@stencil/core";

@Component({
  tag: "app-select-option",
  styleUrl: "select-option.scss",
  shadow: true,
})
export class AppSelectOption {
  /**
   * value
   */
  @Prop() public value;
  /**
   * label
   */
  @Prop() public label = "";
  /**
   * active
   */
  @State() public active = false;
  /**
   * focused
   */
  @State() public focused = false;
  /**
   * multiple
   */
  @Prop() public multiple = false;
  /**
   * activate
   */
  @Method()
  public async activate() {
    this.active = true;
  }
  /**
   * deactivate
   */
  @Method()
  public async deactivate() {
    this.active = false;
  }
  /**
   * select
   */
  @Method()
  public async select() {
    this.focused = true;
  }
  /**
   * deselect
   */
  @Method()
  public async deselect() {
    this.focused = false;
  }

  render() {
    return (
      <Host
        class={
          (this.active ? "active" : "") +
          " " +
          (this.focused ? "focused" : "") +
          " " +
          (this.multiple ? "multiple" : "")
        }
      >
        <input type='checkbox' />
        {this.label.length > 0 ? this.label : this.value}
      </Host>
    );
  }
}
