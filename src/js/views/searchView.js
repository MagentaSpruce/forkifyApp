class SearchView {
  #parentEl = document.querySelector('.search');

  getQuery() {
    //Gets user search query
    const query = this.#parentEl.querySelector('.search__field').value;

    console.log(query);
    //   this.#clearInput();
    return query;
  }

  #clearInput = () => {
    this.#parentEl.querySelector('search__field').value = '';
  };

  addHandlerSearch(handler) {
    this.#parentEl.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }
}

export default new SearchView();
