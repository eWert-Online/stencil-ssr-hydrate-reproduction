import { h, Component, Host, Prop } from "@stencil/core";

@Component({
  tag: "app-group-site-footer-contact",
  styleUrl: "group-site-footer-contact.scss",
  shadow: true,
})
export class AppGroupSiteFooterContact {
  /**
   * The label of the group
   */
  @Prop() public label!: string;

  /**
   * An optional link on the label
   */
  @Prop() public href?: string;

  /**
   * The target of the link on the label.
   * If this is '_blank', rel="noopener noreferrer" is added automatically.
   */
  @Prop() public target: "_top" | "_parent" | "_blank" | "_self" = "_self";

  render() {
    return (
      <Host class='Contact'>
        <h6 class='Contact-title'>
          {this.href ? (
            <a href={this.href} target={this.target} rel={this.target === "_blank" ? "noopener noreferrer" : null}>
              {this.label}
            </a>
          ) : (
            this.label
          )}
        </h6>
        <slot />
        <nav>
          <ul>
            <slot name='links' />
          </ul>
        </nav>
      </Host>
    );
  }
}
