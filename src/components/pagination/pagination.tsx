import { Component, Host, h, Prop, State, Watch, Event, EventEmitter } from "@stencil/core";
import breakpoints from "../../utils/breakpoints";

@Component({
  tag: "app-pagination",
  styleUrl: "pagination.scss",
  shadow: true,
})
export class AppPagination {
  /**
   * The total number of items.
   */
  @Prop() public total!: number;

  /**
   * The limit of items to display on one page (page size).
   */
  @Prop() public limit!: number;

  /**
   * The current offset of the paginated list.
   */
  @Prop({ mutable: true }) public offset?: number = 0;

  @State() public pages: Array<number> = [1];

  @State() public currentPage: number = 1;

  /**
   * The current window width
   */
  @State() windowWidth = window.innerWidth;

  /**
   * Emitted with the new offset, as soon as page changes
   */
  @Event() private stPageChange: EventEmitter<number>;

  private handlePageClick = (pageNumber: number) => {
    this.currentPage = pageNumber;
    this.offset = this.limit * (pageNumber - 1);

    this.stPageChange.emit(this.offset);
  };

  private setPages = (total: number, limit: number) => {
    const numPages = Math.ceil(total / limit);
    this.currentPage = Math.ceil((this.offset + 1) / limit) || 0;
    this.pages = Array.from({ length: numPages }).map((_, index) => index + 1);
  };

  private setWindowWidth = () => {
    this.windowWidth = window.innerWidth;
  };

  connectedCallback() {
    this.setPages(this.total, this.limit);
    window.addEventListener("resize", this.setWindowWidth);
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this.setWindowWidth);
  }

  @Watch("limit")
  watchLimit(newLimit: number) {
    this.setPages(this.total, newLimit);
  }

  @Watch("total")
  watchTotal(newTotal: number) {
    this.setPages(newTotal, this.limit);
  }

  render() {
    return (
      <Host
        class={`
                    Pagination
                `}
      >
        <div class='Pagination-container'>
          <button
            class='Pagination-prev'
            disabled={this.currentPage === 1}
            onClick={() => this.handlePageClick(this.currentPage - 1)}
          >
            Prev
          </button>
          {this.pages
            .filter((page) => {
              const isFirstPage = page === 1;
              const isCurrentPage = page === this.currentPage;
              const isLastPage = page === this.pages.length;

              const spaceBefore = this.currentPage - 1;
              const spaceAfter = this.pages.length - this.currentPage;
              const offset = this.windowWidth >= breakpoints.websiteSmall ? 1 : 0;

              const offsetBefore = spaceAfter > offset + offset + 1 ? offset : offset + offset + 2 - spaceAfter;
              const offsetAfter = spaceBefore > offset + offset + 1 ? offset : offset + offset + 2 - spaceBefore;

              const isDirectlyBetween =
                (this.currentPage - offsetBefore - 1 === page && page === 2) ||
                (this.currentPage + offsetAfter + 1 === page && page === this.pages.length - 1);
              const isTooFarFromCurrentPage =
                page < this.currentPage - offsetBefore || page > this.currentPage + offsetAfter;

              const shouldBeRemoved =
                !isFirstPage && !isCurrentPage && !isLastPage && !isDirectlyBetween && isTooFarFromCurrentPage;
              return !shouldBeRemoved;
            })
            .map((page, index, pages) => {
              const firstPage = pages[0];
              const prevPage = pages[index - 1];
              const nextPage = pages[index + 1];
              const lastPage = pages[pages.length - 1];

              return (
                <span>
                  {page === lastPage && prevPage && prevPage !== page - 1 && <span class='Pagination-filler'>...</span>}
                  <button
                    class={`
                                        Pagination-page
                                        ${this.currentPage === page ? "is-active" : ""}
                                    `}
                    onClick={this.currentPage === page ? null : () => this.handlePageClick(page)}
                  >
                    {page}
                  </button>
                  {page === firstPage && nextPage && nextPage !== page + 1 && (
                    <span class='Pagination-filler'>...</span>
                  )}
                </span>
              );
            })}
          <button
            class='Pagination-next'
            disabled={this.currentPage === this.pages.length}
            onClick={() => this.handlePageClick(this.currentPage + 1)}
          >
            Next
          </button>
        </div>
      </Host>
    );
  }
}
