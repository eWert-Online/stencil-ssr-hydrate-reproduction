import { Component, h, Host, Prop, Element, State } from "@stencil/core";

/**
 * @slot intro - The module intro (app-headline-secondary, app-copytext) to display above this module
 * @slot *default* - A list of <app-filter-container-option> to display as dropdown options
 */
@Component({
  tag: "app-filter-container",
  styleUrl: "filter-container.scss",
  shadow: true,
})
export class AppFilterContainer {
  @Element() private el: HTMLAppFilterContainerElement;

  /**
   * The base api url to request the news from.
   */
  @Prop() apiUrl!: string;

  /**
   * The language to fetch the news in.
   */
  @Prop() language: "en" | "fr" | "de" | "ch" | "at" = "de";

  /**
   * The number of results to display on a page
   */
  @Prop() itemsPerPage = 10;

  /**
   * An optional url prefix which is prepended to the href of the news item coming from caas
   */
  @Prop() caasItemUrlPrefix = "";

  /**
   * The label of the basic-1 dropdown
   */
  @Prop() public basic1Label: string;

  /**
   * The value of the basic-1 dropdown
   */
  @Prop({ mutable: true }) public basic1Value?: string;

  /**
   * The label of the year dropdown
   */
  @Prop() public yearLabel: string;

  /**
   * The value of the year dropdown
   */
  @Prop({ mutable: true }) public yearValue?: string;

  /**
   * The label of the refinement-1 dropdown
   */
  @Prop() public refinement1Label: string;

  /**
   * The value of the refinement-1 dropdown
   */
  @Prop({ mutable: true }) public refinement1Value?: string;

  /**
   * The selections label of the refinement-1 dropdown
   */
  @Prop() public refinement1SelectionsLabel: string;

  /**
   * The label of the refinement-2 dropdown
   */
  @Prop() public refinement2Label: string;

  /**
   * The value of the refinement-2 dropdown
   */
  @Prop({ mutable: true }) public refinement2Value?: string;

  /**
   * The selections label of the refinement-2 dropdown
   */
  @Prop() public refinement2SelectionsLabel: string;

  /**
   * The label of the refinement-3 dropdown
   */
  @Prop() public refinement3Label: string;

  /**
   * The value of the refinement-3 dropdown
   */
  @Prop({ mutable: true }) public refinement3Value?: string;

  /**
   * The selections label of the refinement-3 dropdown
   */
  @Prop() public refinement3SelectionsLabel: string;

  /**
   * The text of the submit button. `{{numResults}}` will be replaced by the number of results.
   */
  @Prop() public submitText: string = "";

  /**
   * The text of the search-results headline. `{{numResults}}` will be replaced by the number of results.
   */
  @Prop() searchResultsText: string = "";

  /**
   * The headline to show above the refinement section
   */
  @Prop() public refinementHeadline: string = "";

  @State() private availableFilters?: string[] = null;
  @State() private numEntries?: number = null;

  @State() private startSearch: boolean = false;
  @State() private hasIntro: boolean = false;

  private filters: Array<HTMLAppFilterContainerOptionElement> = [];
  private urlItemSeparator = ";";

  connectedCallback() {
    this.filters = Array.from(this.el.querySelectorAll("app-filter-container-option"));

    const url = new URL(window.location.href);
    let triggerSearch = false;
    if (url.searchParams.has("basic_1")) {
      const value = this.filters.find(
        (filter) => filter.category === "basic-1" && filter.label === url.searchParams.get("basic_1"),
      )?.value;
      this.basic1Value = value;
      triggerSearch = true;
    }
    if (url.searchParams.has("year")) {
      const value = this.filters.find(
        (filter) => filter.category === "year" && filter.label === url.searchParams.get("year"),
      )?.value;
      this.yearValue = value;
      triggerSearch = true;
    }
    if (url.searchParams.has("ref_1")) {
      const value = this.filters
        .filter(
          (filter) =>
            filter.category === "refinement-1" &&
            url.searchParams.get("ref_1").split(this.urlItemSeparator).includes(filter.label),
        )
        .map((filter) => filter.value)
        .join(",");
      this.refinement1Value = value;
      triggerSearch = true;
    }
    if (url.searchParams.has("ref_2")) {
      const value = this.filters
        .filter(
          (filter) =>
            filter.category === "refinement-2" &&
            url.searchParams.get("ref_2").split(this.urlItemSeparator).includes(filter.label),
        )
        .map((filter) => filter.value)
        .join(",");
      this.refinement2Value = value;
      triggerSearch = true;
    }
    if (url.searchParams.has("ref_3")) {
      const value = this.filters
        .filter(
          (filter) =>
            filter.category === "refinement-3" &&
            url.searchParams.get("ref_3").split(this.urlItemSeparator).includes(filter.label),
        )
        .map((filter) => filter.value)
        .join(",");
      this.refinement3Value = value;
      triggerSearch = true;
    }

    if (triggerSearch) {
      this.search();
    }
  }

  componentDidLoad() {
    const introSlot = this.el.shadowRoot.querySelector('slot[name="intro"]') as HTMLSlotElement;
    this.hasIntro = introSlot.assignedNodes().length > 0;
    introSlot?.addEventListener("slotchange", () => {
      this.hasIntro = introSlot.assignedNodes().length > 0;
    });
    this.triggerUpdate();
  }

  private getFilter = () => {
    const categories = [this.basic1Value].filter((v) => v && v !== "__all__");

    let categoriesFilter = {};
    if (categories.length > 0) {
      categoriesFilter = {
        categories: {
          $in: categories,
        },
      };
    }

    const tags = [
      ...(this.refinement1Value?.split(",") ?? []),
      ...(this.refinement2Value?.split(",") ?? []),
      ...(this.refinement3Value?.split(",") ?? []),
    ].filter(Boolean);

    let tagsFilter = {};
    if (tags.length > 0) {
      tagsFilter = {
        tags: {
          $in: tags,
        },
      };
    }

    let dateFilter = {};
    if (this.yearValue && this.yearValue !== "__all__") {
      dateFilter = {
        date: {
          $gte: new Date(`${this.yearValue}-01-01T00:00:00`).toISOString(),
          $lte: new Date(`${this.yearValue}-12-31T23:59:59`).toISOString(),
        },
      };
    }

    const filter = {
      ...categoriesFilter,
      ...tagsFilter,
      ...dateFilter,
    };

    return JSON.stringify(filter);
  };

  private collectMeta = async (page: number, acc: string[]) => {
    const requestPageSize = 20;
    const baseURL = `${this.apiUrl}/${this.language}/entities/pressExcerptMeta`;
    const url = `${baseURL}?filter=${this.getFilter()}&page=${page}&pagesize=${requestPageSize}`;
    const response = await fetch(url, {
      headers: new Headers({ "content-type": "application/json" }),
    });
    const json = await response.json();
    const availableFilters = json.entities.reduce(
      (acc: string[], curr: { categories: string[]; tags: string[]; year: string }) => {
        const categories = curr.categories || [];
        const tags = curr.tags || [];
        return [...acc, ...categories, ...tags, curr.year];
      },
      [],
    );

    if (json.total === json.pageSize * json.page || json.pageSize < requestPageSize) {
      // This is the last Page
      return {
        numEntries: json.total,
        availableFilters: [...acc, ...availableFilters],
      };
    } else {
      // There are more pages!
      return this.collectMeta(page + 1, [...acc, ...availableFilters]);
    }
  };

  private triggerUpdate = async () => {
    const url = new URL(window.location.href);
    if (this.basic1Value) {
      const label = this.filters.find(
        (filter) => filter.category === "basic-1" && filter.value === this.basic1Value,
      )?.label;
      url.searchParams.set("basic_1", label);
    } else {
      url.searchParams.delete("basic_1");
    }
    if (this.yearValue) {
      const label = this.filters.find((filter) => filter.category === "year" && filter.value === this.yearValue)?.label;
      url.searchParams.set("year", label);
    } else {
      url.searchParams.delete("year");
    }
    if (this.refinement1Value) {
      const label = this.filters
        .filter(
          (filter) => filter.category === "refinement-1" && this.refinement1Value.split(",").includes(filter.value),
        )
        .map((filter) => filter.label)
        .join(this.urlItemSeparator);
      url.searchParams.set("ref_1", label);
    } else {
      url.searchParams.delete("ref_1");
    }
    if (this.refinement2Value) {
      const label = this.filters
        .filter(
          (filter) => filter.category === "refinement-2" && this.refinement2Value.split(",").includes(filter.value),
        )
        .map((filter) => filter.label)
        .join(this.urlItemSeparator);
      url.searchParams.set("ref_2", label);
    } else {
      url.searchParams.delete("ref_2");
    }
    if (this.refinement3Value) {
      const label = this.filters
        .filter(
          (filter) => filter.category === "refinement-3" && this.refinement3Value.split(",").includes(filter.value),
        )
        .map((filter) => filter.label)
        .join(this.urlItemSeparator);
      url.searchParams.set("ref_3", label);
    } else {
      url.searchParams.delete("ref_3");
    }

    history.replaceState(null, "", url.toString());

    const { numEntries, availableFilters } = await this.collectMeta(1, []);
    this.numEntries = numEntries;
    this.availableFilters = Array.from(new Set(availableFilters));
  };

  private search = () => {
    this.startSearch = true;
  };

  render() {
    return (
      <Host
        class={`
                    FilterContainer
                `}
      >
        <div class='FilterContainer-container'>
          <div class='FilterContainer-intro' style={!this.hasIntro ? { display: "none" } : null}>
            <slot name='intro' />
          </div>

          <div class='FilterContainer-basic'>
            <div class='FilterContainer-basicDropdown'>
              <app-dropdown
                label={this.basic1Label}
                value={this.basic1Value}
                name='basic-1'
                multiple={false}
                onChange={(e) => {
                  this.basic1Value = e.detail;
                  this.triggerUpdate();
                }}
              >
                {this.filters
                  .filter((f) => f.category === "basic-1")
                  .map((f) => (
                    <app-dropdown-option label={f.label} value={f.value} />
                  ))}
              </app-dropdown>
            </div>
            <div class='FilterContainer-basicDropdown'>
              <app-dropdown
                label={this.yearLabel}
                value={this.yearValue}
                name='year'
                multiple={false}
                onChange={(e) => {
                  this.yearValue = e.detail;
                  this.triggerUpdate();
                }}
              >
                {this.filters
                  .filter((f) => f.category === "year")
                  .map((f) => (
                    <app-dropdown-option label={f.label} value={f.value} />
                  ))}
              </app-dropdown>
            </div>
            <div class='FilterContainer-submit'>
              <app-button-primary
                class='FilterContainer-submitButton'
                text={this.submitText.replace("{{numResults}}", this.numEntries?.toString() ?? "")}
                onClick={this.search}
                disabled={this.numEntries <= 0}
              />
            </div>
          </div>

          <app-headline-quaternary class='FilterContainer-refinementHeadline' tag='h3' text={this.refinementHeadline} />
          <div class='FilterContainer-refinement'>
            <div class='FilterContainer-refinementColumn'>
              <app-dropdown
                label={this.refinement1Label}
                value={this.refinement1Value}
                name='refinement-1'
                multiple
                multipleSelectionsLabel={this.refinement1SelectionsLabel}
                onChange={(e: CustomEvent<string[]>) => {
                  this.refinement1Value = e.detail.join(",");
                  this.triggerUpdate();
                }}
              >
                {this.filters
                  .filter((f) => f.category === "refinement-1")
                  .map((f) => (
                    <app-dropdown-option
                      label={f.label}
                      value={f.value}
                      disabled={
                        !this.availableFilters ? false : f.value !== "" && !this.availableFilters.includes(f.value)
                      }
                    />
                  ))}
              </app-dropdown>
            </div>
            <div class='FilterContainer-refinementColumn'>
              <app-dropdown
                label={this.refinement2Label}
                value={this.refinement2Value}
                name='refinement-2'
                multiple
                multipleSelectionsLabel={this.refinement2SelectionsLabel}
                onChange={(e: CustomEvent<string[]>) => {
                  this.refinement2Value = e.detail.join(",");
                  this.triggerUpdate();
                }}
              >
                {this.filters
                  .filter((f) => f.category === "refinement-2")
                  .map((f) => (
                    <app-dropdown-option
                      label={f.label}
                      value={f.value}
                      disabled={
                        !this.availableFilters ? false : f.value !== "" && !this.availableFilters.includes(f.value)
                      }
                    />
                  ))}
              </app-dropdown>
            </div>
            <div class='FilterContainer-refinementColumn'>
              <app-dropdown
                label={this.refinement3Label}
                value={this.refinement3Value}
                name='refinement-3'
                multiple
                multipleSelectionsLabel={this.refinement3SelectionsLabel}
                onChange={(e: CustomEvent<string[]>) => {
                  this.refinement3Value = e.detail.join(",");
                  this.triggerUpdate();
                }}
              >
                {this.filters
                  .filter((f) => f.category === "refinement-3")
                  .map((f) => (
                    <app-dropdown-option
                      label={f.label}
                      value={f.value}
                      disabled={
                        !this.availableFilters ? false : f.value !== "" && !this.availableFilters.includes(f.value)
                      }
                    />
                  ))}
              </app-dropdown>
            </div>
          </div>

          <div style={{ display: "none" }}>
            <slot />
          </div>
        </div>

        {this.startSearch && (
          <div class='FilterContainer-results'>
            <app-press-excerpt-list
              searchOnLoad={true}
              total={this.numEntries}
              apiUrl={this.apiUrl}
              caasItemUrlPrefix={this.caasItemUrlPrefix}
              language={this.language}
              itemsPerPage={this.itemsPerPage}
              filter={this.getFilter()}
            >
              <app-module-intro
                slot='intro'
                headlineTag='h3'
                headlineText={this.searchResultsText.replace("{{numResults}}", this.numEntries?.toString() ?? "")}
                highlight={true}
              />
            </app-press-excerpt-list>
          </div>
        )}
      </Host>
    );
  }
}
