import { Component, h, Prop, Host, Event, EventEmitter } from "@stencil/core";

@Component({
  tag: "app-tag",
  styleUrl: "tag.scss",
  shadow: true,
})
export class AppTag {
  /**
   * The label of the tag
   */
  @Prop() public label!: string;

  /**
   * Emitted, as soon as the remove button on the tag is clicked
   */
  @Event() private stRemove: EventEmitter;

  private handleRemove = () => {
    this.stRemove.emit();
  };

  render() {
    return (
      <Host
        class={`
                    Tag
                `}
      >
        <div class='Tag-wrapper'>
          <span class='Tag-label'>{this.label}</span>
          <button class='Tag-remove' onClick={this.handleRemove} aria-label='remove' />
        </div>
      </Host>
    );
  }
}
