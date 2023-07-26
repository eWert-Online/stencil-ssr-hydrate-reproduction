import { Host, Component, h, Prop, Element } from "@stencil/core";

/**
 * @slot *default* - The content to display inside this item
 */
@Component({
  tag: "app-construction-limit-banner-item",
  styleUrl: "construction-limit-banner-item.scss",
  shadow: true,
})
export class AppConstructionLimitBannerItem {
  @Element() el: HTMLAppConstructionLimitBannerItemElement;

  /**
   * The headline of this item (optional)
   */
  @Prop() public headline?: string;

  /**
   * The path to the icon of this item
   */
  @Prop() public iconSrc?: string;

  componentDidLoad() {
    this.el.querySelectorAll("app-copytext").forEach((copytext: HTMLAppCopytextElement) => {
      copytext.inverted = true;
    });
    this.el.querySelectorAll("app-unordered-list").forEach((ul: HTMLAppUnorderedListElement) => {
      ul.inverted = true;
    });
  }

  render() {
    return (
      <Host
        class={`
                    ConstructionLimitBannerItem
                    ${this.headline ? "ConstructionLimitBannerItem--hasHeadline" : ""}
                `}
      >
        <div class='ConstructionLimitBannerItem-content'>
          {this.iconSrc ? (
            <img class='ConstructionLimitBannerItem-icon' src={this.iconSrc} aria-hidden='true' alt='' />
          ) : (
            <span class='ConstructionLimitBannerItem-icon' />
          )}
          {this.headline && <span class='ConstructionLimitBannerItem-headline'>{this.headline}</span>}
          <app-text-content class='ConstructionLimitBannerItem-text'>
            <slot />
          </app-text-content>
        </div>
      </Host>
    );
  }
}
