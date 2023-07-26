import { h, Component, Host, Prop } from "@stencil/core";

@Component({
  tag: "app-group-site-footer-nav-link",
  styleUrl: "group-site-footer-nav-link.scss",
  shadow: true,
})
export class AppGroupSiteFooterNavLink {
  /**
   * The text inside the link
   */
  @Prop() public text!: string;

  /**
   * The url of the link
   */
  @Prop() public href!: string;

  /**
   * The target of the link.
   * If this is '_blank', rel="noopener noreferrer" is added automatically.
   */
  @Prop() public target: "_top" | "_parent" | "_blank" | "_self" = "_self";

  render() {
    return (
      <Host>
        <li>
          <a href={this.href} target={this.target} rel={this.target === "_blank" ? "noopener noreferrer" : null}>
            {this.text}
          </a>
        </li>
      </Host>
    );
  }
}
