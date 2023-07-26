/* eslint-disable */
import { Component, Host, h, Prop, Element } from "@stencil/core";

@Component({
  tag: "app-copytext",
  styleUrl: "copytext.scss",
  shadow: true,
})
export class Copytext {
  @Element() el: HTMLElement;

  /**
   * The font-size of the copytext.
   */
  @Prop() public size?: "S" | "M" | "L" | "XL" = "M";

  /**
   * If the copytext should be displayed inverted (white instead of black)
   */
  @Prop() public inverted?: boolean = false;

  /**
   * If the copytext should be displayed highlighted (grey instead of black)
   */
  @Prop() public highlighted?: boolean = false;

  private unwrapTag = (el: Element) => {
    const parent = el.parentNode;
    const unwrappedChildren = [];
    while (el.firstChild) {
      parent.insertBefore(el.firstChild, el);
      unwrappedChildren.push(el.firstChild);
    }

    parent.removeChild(el);
    return unwrappedChildren;
  };

  private changeTag = (el: Element, newTagName: string) => {
    const newEl = document.createElement(newTagName);

    while (el.firstChild) {
      newEl.appendChild(el.firstChild);
    }

    el.getAttributeNames().forEach((attrName) => {
      const attrValue = el.getAttribute(attrName);
      newEl.setAttribute(attrName, attrValue);
    });

    el.parentNode.replaceChild(newEl, el);
    return newEl;
  };

  private updateElements = (elements: Element[], listLevel = 1, parentUl = null) => {
    elements.forEach((el) => {
      let newListLevel = listLevel;
      let newEl = el;
      switch (el.nodeName) {
        case "UL": {
          el.querySelectorAll(":scope > li").forEach((li) => {
            const newLi = this.changeTag(li, "app-unordered-list-item") as HTMLAppUnorderedListItemElement;
            newLi.level = listLevel;
          });
          const newUl = this.changeTag(el, "app-unordered-list") as HTMLAppUnorderedListElement;
          newUl.size = this.size;
          newEl = newUl;
          parentUl = newUl;
          newListLevel += 1;
          break;
        }
        case "OL": {
          el.querySelectorAll("li").forEach((li) => this.changeTag(li, "app-ordered-list-item"));
          const newOl = this.changeTag(el, "app-ordered-list") as HTMLAppUnorderedListElement;
          newOl.size = this.size;
          break;
        }
        case "A": {
          if (this.inverted) {
            if (!el.classList.contains("light")) {
              el.classList.add("light");
            }
          } else {
            el.classList.remove("light");
          }
        }
      }
      if (newEl.children.length > 0) {
        this.updateElements(Array.from(newEl.children), newListLevel, parentUl);
      }
    });
  };

  componentDidLoad() {
    const els = this.el.shadowRoot.querySelector("slot").assignedElements({ flatten: true });
    this.updateElements(els);
  }

  componentDidUpdate() {
    const els = this.el.shadowRoot.querySelector("slot").assignedElements({ flatten: true });
    this.updateElements(els);
  }

  render() {
    return (
      <Host
        class={`
            Copytext
            ${this.size ? "Copytext--" + this.size.toLowerCase() : ""}
            ${this.inverted ? "Copytext--inverted" : ""}
            ${this.highlighted ? "Copytext--highlighted" : ""}
        `}
      >
        <slot />
      </Host>
    );
  }
}
