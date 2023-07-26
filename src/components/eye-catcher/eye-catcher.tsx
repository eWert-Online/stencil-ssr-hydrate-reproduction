import { Component, h, Prop, Host, Element } from "@stencil/core";

/**
 * @slot headline - The headline of the eye catcher
 * @slot text - The text content of the eye catcher
 * @slot subtext - The subtext content of the eye catcher
 */
@Component({
  tag: "app-eye-catcher",
  styleUrl: "eye-catcher.scss",
  shadow: true,
})
export class AppEyeCatcher {
  @Element() el: HTMLAppEyeCatcherElement;

  /**
   * The background-color to use for the eye catcher
   */
  @Prop() public color: "red" | "grey" = "red";

  /**
   * The position of the tip
   */
  @Prop() public tipPosition: "top" | "bottom" = "top";

  componentDidLoad() {
    this.el.querySelectorAll("a").forEach((a) => {
      if (!a.classList.contains("light")) {
        a.classList.add("light");
      }
    });
  }

  render() {
    return (
      <Host
        class={`
                EyeCatcher
                EyeCatcher--${this.color}
                EyeCatcher--${this.tipPosition}
            `}
      >
        <div class='EyeCatcher-container'>
          <div class='EyeCatcher-headline'>
            <slot name='headline' />
          </div>
          <div class='EyeCatcher-text'>
            <slot name='text' />
            <div class='EyeCatcher-subtext'>
              <slot name='subtext' />
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
