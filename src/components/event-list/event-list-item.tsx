import { Component, h, Prop, Host, State } from "@stencil/core";

@Component({
  tag: "app-event-list-item",
  styleUrl: "event-list-item.scss",
  shadow: true,
})
export class AppEventListItem {
  /**
   * The day to display inside of the calendar
   */
  @Prop() public calendarDay!: string;

  /**
   * The month (abbreveated) to display inside of the calendar
   */
  @Prop() public calendarMonth!: string;

  /**
   * The date label to display above the headline
   */
  @Prop() public date!: string;

  /**
   * The time label to display above the headline
   */
  @Prop() public time?: string;

  /**
   * The headline of the event
   */
  @Prop() public headline!: string;

  /**
   * The location of the event
   */
  @Prop() public location!: string;

  /**
   * The url, the event should link to
   */
  @Prop() public href?: string;

  /**
   * The target of the link.
   * If this is '_blank', rel="noopener noreferrer" is added automatically.
   */
  @Prop() public target: "_top" | "_parent" | "_blank" | "_self" = "_self";

  /**
   * true of the elements links (headline, image or textlink) are hovered
   */
  @State() public hovered: boolean = false;

  private setHovered = () => {
    this.hovered = true;
  };

  private unsetHovered = () => {
    this.hovered = false;
  };

  render() {
    const innerContent = [
      <div class='EventListItem-calendar'>
        <div class='EventListItem-calendarRings'>
          <span class='EventListItem-calendarRing' />
          <span class='EventListItem-calendarRing' />
          <span class='EventListItem-calendarRing' />
          <span class='EventListItem-calendarRing' />
          <span class='EventListItem-calendarRing' />
        </div>
        <span class='EventListItem-calendarTearLine' />
        <div class='EventListItem-calendarDay'>{this.calendarDay}</div>
        <div class='EventListItem-calendarMonth'>{this.calendarMonth}</div>
      </div>,
      <div class='EventListItem-content'>
        <div class='EventListItem-meta'>
          <span class='EventListItem-date'>{this.date}</span>
          {this.time && <span class='EventListItem-time'>{this.time}</span>}
        </div>
        <h4 class='EventListItem-headline'>{this.headline}</h4>
        <div class='EventListItem-location'>{this.location}</div>
      </div>,
    ];

    return (
      <Host
        class={`
                    EventListItem
                    ${this.hovered ? "EventListItem--hovered" : ""}
                `}
      >
        {this.href ? (
          <a
            class='EventListItem-container'
            href={this.href}
            target={this.target}
            rel={this.target === "_blank" ? "noopener noreferrer" : null}
            onMouseOver={this.setHovered}
            onMouseOut={this.unsetHovered}
          >
            {innerContent}
          </a>
        ) : (
          <div class='EventListItem-container'>{innerContent}</div>
        )}
      </Host>
    );
  }
}
