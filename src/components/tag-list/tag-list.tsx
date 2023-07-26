import { Component, Host, h, Prop, EventEmitter, Event } from "@stencil/core";

/**
 * @slot *default* - A list of <app-tag> to display in a grid
 */
@Component({
  tag: "app-tag-list",
  styleUrl: "tag-list.scss",
  shadow: true,
})
export class AppTagList {
  /**
   * The text of the remove all tags button. If left empty, the button is not displayed.
   */
  @Prop() removeAllText: string = null;

  /**
   * Emitted, when the "remove all tags" button is clicked.
   */
  @Event() removeAll: EventEmitter;

  private handleRemoveAll = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    this.removeAll.emit();
  };

  render() {
    return (
      <Host
        class={`
                    TagList
                `}
      >
        <div class='TagList-tags'>
          <slot />
        </div>
        {this.removeAllText && (
          <button class='TagList-removeAll' onClick={this.handleRemoveAll}>
            {this.removeAllText}
          </button>
        )}
      </Host>
    );
  }
}
