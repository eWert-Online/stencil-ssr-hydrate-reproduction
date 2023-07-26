import { Component, Prop } from "@stencil/core";

@Component({
  tag: "app-filter-container-option",
  shadow: true,
})
export class AppFilterContainerOption {
  /**
   * In which caregory the option should be placed.
   */
  @Prop() public category!: "basic-1" | "year" | "refinement-1" | "refinement-2" | "refinement-3";

  /**
   * The label of the option
   */
  @Prop() public label!: string;

  /**
   * The value of the option
   */
  @Prop() public value!: string;

  /**
   * `true` if the option should be disabled
   */
  @Prop() public disabled: boolean = false;

  render() {
    return null;
  }
}
