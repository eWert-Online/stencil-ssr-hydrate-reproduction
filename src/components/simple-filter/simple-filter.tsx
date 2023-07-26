import { Component, h, Host, Element, Prop, State } from "@stencil/core";
import breakpoints from "../../utils/breakpoints";

/**
 * @slot *default* - A list of <app-simple-filter-item tag="..."> to show / hide based on the selection
 * @slot intro - The module-intro to display above this module (optional)
 * @slot headline - The <app-headline-quaternary> to display as a headline of this module (optional)
 */
@Component({
  tag: "app-simple-filter",
  styleUrl: "simple-filter.scss",
  shadow: true,
})
export class AppSimpleFilter {
  @Element() private el: HTMLAppSimpleFilterElement;

  /**
   * The text to display inside the dropdown if multiple selections were made.
   * `{num}` will be replaced by the number of filters selected.
   */
  @Prop() public dropdownMultipleSelectionsLabel?: string = "{num} filter(s) selected";

  /**
   * The label of the option to select all elements
   */
  @Prop() public selectAllLabel!: string;

  /**
   * If this component should render checkboxes or a dropdown
   */
  @State() shouldRenderCheckboxes = window.innerWidth >= breakpoints.medium;

  /**
   * The currently selected filters
   */
  @State() private selectedFilters: Array<string> = ["__all__"];

  private filterItems: Array<HTMLAppSimpleFilterItemElement> = [];
  private filterTags: Array<string> = [];

  private setShouldRenderDropdown = () => {
    this.shouldRenderCheckboxes = window.innerWidth >= breakpoints.medium;
  };

  private handleCheckboxSelection = (tag: string) => {
    if (tag === "__all__") {
      this.selectedFilters = ["__all__"];
    } else {
      if (this.selectedFilters.includes(tag)) {
        this.selectedFilters = this.selectedFilters.filter((t) => t !== tag);
      } else {
        this.selectedFilters = [tag, ...this.selectedFilters];
      }
    }
  };

  private lastDropdownSelection = ["__all__"];
  private handleDropdownSelection = (tags: Array<string>) => {
    if (tags.length === 0 || (!this.lastDropdownSelection.includes("__all__") && tags.includes("__all__"))) {
      this.selectedFilters = ["__all__"];
      this.lastDropdownSelection = ["__all__"];
    } else {
      this.selectedFilters = tags;
      this.lastDropdownSelection = tags.filter((t) => t !== "__all__");
    }
  };

  connectedCallback() {
    this.filterItems = Array.from(
      this.el.querySelectorAll("app-simple-filter-item"),
    ) as Array<HTMLAppSimpleFilterItemElement>;
    this.filterTags = [...new Set(this.filterItems.map((filter) => filter.tag))];
    window.addEventListener("resize", this.setShouldRenderDropdown);
  }

  componentDidUpdate() {
    const hasAppliedFilters = this.selectedFilters.filter((f) => f !== "__all__").length !== 0;
    if (!hasAppliedFilters) {
      this.filterItems.forEach((filterItem) => {
        filterItem.hidden = false;
      });
    } else {
      this.filterItems.forEach((filterItem) => {
        filterItem.hidden = !this.selectedFilters.includes(filterItem.tag);
      });
    }
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this.setShouldRenderDropdown);
  }

  render() {
    const appliedFilters = this.selectedFilters.filter((f) => f !== "__all__");
    const hasAppliedFilters = appliedFilters.length !== 0;

    return (
      <Host
        class={`
                    SimpleFilter
                `}
      >
        <div class='SimpleFilter-wrapper'>
          <slot name='intro' />
          <slot name='headline' />
          {this.shouldRenderCheckboxes ? (
            <div class='SimpleFilter-filters'>
              <div class='SimpleFilter-filter'>
                <app-checkbox
                  name={`select-all`}
                  onStChange={() => {
                    this.handleCheckboxSelection("__all__");
                  }}
                  checked={!hasAppliedFilters}
                >
                  {this.selectAllLabel}
                </app-checkbox>
              </div>
              {this.filterTags.map((tag) => (
                <div class='SimpleFilter-filter'>
                  <app-checkbox
                    name={`filter-${tag.replace(/%s/g, "")}`}
                    onStChange={() => {
                      this.handleCheckboxSelection(tag);
                    }}
                    checked={this.selectedFilters.includes(tag)}
                  >
                    {tag}
                  </app-checkbox>
                </div>
              ))}
            </div>
          ) : (
            <div class='SimpleFilter-filters'>
              <div class='SimpleFilter-filter'>
                <app-dropdown
                  class='SimpleFilter-dropdown'
                  label=''
                  multiple-selections-label={
                    hasAppliedFilters ? this.dropdownMultipleSelectionsLabel : this.selectAllLabel
                  }
                  value={hasAppliedFilters ? appliedFilters : ["__all__"]}
                  name='filters'
                  multiple={true}
                  onChange={(e) => {
                    this.handleDropdownSelection(e.detail);
                  }}
                >
                  <app-dropdown-option value='__all__' label={this.selectAllLabel} />
                  {this.filterTags.map((tag) => (
                    <app-dropdown-option value={tag} label={tag} />
                  ))}
                </app-dropdown>
              </div>
            </div>
          )}
        </div>
        <div class='SimpleFilter-content'>
          <slot />
        </div>
      </Host>
    );
  }
}
