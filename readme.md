#Forkify Recipe Application

This project creates a recipe application which utilizes a custom API. This project was constructed following the instructions of Jonas Schedtmann, a Udemy instructor.

Building this project has helped me to better learn and practice the following:
1) Project planning
2) Working with API's
3) Dynamically inserting content
4) Guard clauses
5) Using external libraries (npmjs.com)
6) MVC architecture
7) Code refactoring / DRY
8) Pagination
9) createRange()
10) createContextualFragment()
11) isEqualNode()
12) nodeValue
13) Using local storage
14) FormData()
15) fromEntries()
16) replaceAll()


A general walkthrough of the unfactored, functional code is below. To see the fully refactored and finalized code, please check the relevant files in this directory.

Firstly an AJAX call is made to the API(https://forkify-api.herokuapp.com/v2) using the showRecipe() function to load and format a recipe from the API.
```JavaScript
const showRecipe = async function () {
  try {
    const res = await fetch(
      'https://forkify-api.herokuapp.com/api/v2/recipes/5ed6604591c37cdc054bc96e'
    );
    const data = await res.json();
  
    if (!res.ok) throw new Error(`${data.message}(${res.status})`);

    let { recipe } = data.data;
    recipe = {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceURL: recipe.sourceURL,
      image: recipe.image_url,
      servings: recipe.servings,
      cookingTime: recipe.cooking_time,
      ingredients: recipe.ingredients,
    };
  } catch (err) {
    alert(err);
  }
};
showRecipe();
```


To render the newly fetched recipe, HTML was dynamically edited using template literals and then inserted into the recipeContainer. *To make the SVG icons work, they had to be imported into the dist folder (import icons from 'url:../img/icons.svg';)
```JavaScript
const markup = `
    <figure class="recipe__fig">
          <img src="${recipe.image}" alt="${
      recipe.title
    }" class="recipe__img" />
          <h1 class="recipe__title">
            <span>${recipe.title}</span>
          </h1>
        </figure>

        <div class="recipe__details">
          <div class="recipe__info">
            <svg class="recipe__info-icon">
              <use href="${icons}#icon-clock"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--minutes">${
              recipe.cookingTime
            }</span>
            <span class="recipe__info-text">minutes</span>
          </div>
          <div class="recipe__info">
            <svg class="recipe__info-icon">
              <use href="${icons}#icon-users"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--people">${
              recipe.servings
            }</span>
            <span class="recipe__info-text">servings</span>

            <div class="recipe__info-buttons">
              <button class="btn--tiny btn--increase-servings">
                <svg>
                  <use href="${icons}#icon-minus-circle"></use>
                </svg>
              </button>
              <button class="btn--tiny btn--increase-servings">
                <svg>
                  <use href="${icons}#icon-plus-circle"></use>
                </svg>
              </button>
            </div>
          </div>

          <div class="recipe__user-generated">
            <svg>
              <use href="${icons}#icon-user"></use>
            </svg>
          </div>
          <button class="btn--round">
            <svg class="">
              <use href="${icons}#icon-bookmark-fill"></use>
            </svg>
          </button>
        </div>

        <div class="recipe__ingredients">
          <h2 class="heading--2">Recipe ingredients</h2>
          <ul class="recipe__ingredient-list">
            ${recipe.ingredients
              .map(ing => {
                return `
              <li class="recipe__ingredient">
              <svg class="recipe__icon">
                <use href="${icons}#icon-check"></use>
              </svg>
              <div class="recipe__quantity">${ing.quantity}</div>
              <div class="recipe__description">
                <span class="recipe__unit">${ing.unit}</span>
                ${ing.description}
              </div>
            </li>
              `;
              })
              .join('')}
          </ul>
        </div>

        <div class="recipe__directions">
          <h2 class="heading--2">How to cook it</h2>
          <p class="recipe__directions-text">
            This recipe was carefully designed and tested by
            <span class="recipe__publisher">${
              recipe.publisher
            }</span>. Please check out
            directions at their website.
          </p>
          <a
            class="btn--small recipe__btn"
            href="${recipe.sourceURL}"
            target="_blank"
          >
            <span>Directions</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </a>
        </div>
        `;
    recipeContainer.innerHTML = '';
    recipeContainer.insertAdjacentHTML('afterbegin', markup);
```


To render a waiting spinner during loading times the renderSpinner() function was created and later called during the showRecipe() function.
```JavaScript
const renderSpinner = function (parentEl) {
  const markup = `
        <div class="spinner">
          <svg>
            <use href="${icons}"></use>
          </svg>
        </div>
        `;
  parentEl.innerHTML = '';
  parentEl.insertAdjacentHTML('afterbegin', markup);
};
```


To dynamically retrieve the ID of a recipe for manipulation, an add event listener is added to the window awaiting a hashchange and another awaiting a loading event. Then, the id variable is set inside of showRecipe(). slice() is used to remove the #.
```JavaScript
['hashchange', 'load'].forEach(event => window.addEventListener(event, showRecipe));

    const id = window.location.hash.slice(1);
    
        const res = await fetch(
      `https://forkify-api.herokuapp.com/api/v2/recipes/${id}`
```


To implement a more descriptive error handling, the renderError() method was constructed.
```JavaScript
  #errorMessage = `We could not find that recipe! 🙈 Please search for another!`;
  
  renderError(message = this.#errorMessage) {
    const markup = `
    <div class="error">
         <div>
              <svg>
                <use href="${icons}#icon-alert-triangle"></use>
              </svg>
         </div>
         <p>${message}</p>
    </div>
    `;
    this.#clear;
    this.#parentElement.insertAdjacentHTML('afterbegin', markup);
  }
```


This process was repeated for successful handling.
```JavaScript
  #message = '';
  
  renderSuccess(message = this.#message) {
    const markup = `
    <div class="message">
         <div>
              <svg>
                <use href="${icons}#icon-smile"></use>
              </svg>
         </div>
         <p>${message}</p>
    </div>
    `;
    this.#clear;
    this.#parentElement.insertAdjacentHTML('afterbegin', markup);
  }
```


To implement the search recipe functionality the loadSearchResults() async method is constructed and exported to the controller for use there. The controlSearchResults() function is then constructed in the controller which calls loadSearchResults() on a click event or form submission.
```JavaScript
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await getJSON(`${API_URL}?search=${query}`);
    // this is the array of all the objects - map creates new array with new objects
    state.search.results = data.data.recipes.map(recipe => {
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image_url,
      };
    });
  } catch (err) {
    recipeView.renderError();
    throw err;
  }
};

const controlSearchResults = async function () {
  try {
    const query = searchView.getQuery();
    if (!query) return;
    await model.loadSearchResults(query);
  } catch (err) {
  }
};

class SearchView {
  #parentEl = document.querySelector('.search');

  getQuery() {
    //Gets user search query
    return this.#parentEl.querySelector('.search__field').nodeValue;
  }
  
    clearInput() {
    this.#parentEl.querySelector('search__field').value = '';
  }

  addHandlerSearch(handler) {
    this.#parentEl.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }
}

export default new SearchView();
```


To create the search results view list which is rendered to the UI, the ResultsView class was created.
```JavaScript
class ResultsView extends View {
  _parentElement = document.querySelector('.results');

  _generateMarkup() {
    return this._data.map(this._generateMarkupPreview).join('');
  }
  _generateMarkupPreview(result) {
    return `
    <li class="preview">
        <a class="preview__link preview__link--active" href="#${result.id}">
        <figure class="preview__fig">
            <img src="${result.image}" alt="Test" />
        </figure>
        <div class="preview__data">
            <h4 class="preview__title">${result.title}</h4>
            <p class="preview__publisher">${result.publisher}</p>
            <div class="preview__user-generated">
            <svg>
                <use href="${icons}#icon-user"></use>
            </svg>
            </div>
        </div>
        </a>
    </li>
      `;
  }
}
```


To implement pagination on the search results the getSearchResultsPage() function was constructed.
```JavaScript
export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage; //0;
  const end = page * state.search.resultsPerPage; //9;
  return state.search.results.slice(start, end);
};


To implement the pagination, the PaginationView class was created followed by the controlPagination() function.
```JavaScript
class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;

      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    });
  }

  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );

    // Page 1, and there are other pages
    if (curPage === 1 && numPages > 1) {
      return `
        <button data-goto="${
          curPage + 1
        }" class="btn--inline pagination__btn--next">
          <span>Page ${curPage + 1}</span>
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
        </button>
      `;
    }

    // Last page
    if (curPage === numPages && numPages > 1) {
      return `
        <button data-goto="${
          curPage - 1
        }" class="btn--inline pagination__btn--prev">
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>
          <span>Page ${curPage - 1}</span>
        </button>
      `;
    }

    // Other page
    if (curPage < numPages) {
      return `
        <button data-goto="${
          curPage - 1
        }" class="btn--inline pagination__btn--prev">
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>
          <span>Page ${curPage - 1}</span>
        </button>
        <button data-goto="${
          curPage + 1
        }" class="btn--inline pagination__btn--next">
          <span>Page ${curPage + 1}</span>
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
        </button>
      `;
    }

    // Page 1, and there are NO other pages
    return '';
  }
}

export default new PaginationView();


const controlPagination = function (goToPage) {
  // 1) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

```


For updating the recipe serving sizes event handlers are added to the change service buttons which update and rerender the recipe. This is done by way of the updateServings() and controlServings() functions along with the addHandlerUpdateServings() method.
```JavaScript
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    // newQt = oldQt * newServings / oldServings // 2 * 8 / 4 = 4
  });

  state.recipe.servings = newServings;
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);
  // Update the recipe view
  recipeView.render(model.state.recipe);
};

  addHandlerUpdateServings(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--update-servings');
      if (!btn) return;
      const updateTo = +btn.dataset.updateTo;
      if (updateTo > 0) handler(updateTo);
    });
  }
```


A DOM updating algorithm was constructed to only update specified parts of the UI by way of the update() method. a new DOM was created to compare the current with new DOM elements and make any necessary insertions for any changed content.
```JavaScript
  update(data) {
    // if (!data || (Array.isArray(data) && data.length === 0))
    //   return this.renderError();

    this._data = data;
    const newMarkup = this._generateMarkup();

    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      //isEqualNode() compares content of curEl with newEl
      //Updates changed text
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        // console.log('🧓', newEl.firstChild.nodeValue.trim());
        curEl.textContent = newEl.textContent;
      }
      //Updates changed attributes
      if (!newEl.isEqualNode(curEl))
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
    });
  }
```


To implement the bookmarking functionality the controlAddBookmark() function was created inside the model for use in the controller which is then used inside of the addHandlerAddBookmark() method contained within the Recipe View class. To add and remove a bookmark, the addBookmark() and deleteBookmark() functions were created.
```JavaScript
const controlAddBookmark = function () {
  console.log(model.state.recipe.bookmarked);
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  console.log(model.state.recipe);
  recipeView.update(model.state.recipe);
};

  addHandlerAddBookmark(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--bookmark');
      if (!btn) return;
      handler();
    });
  }
  
  export const addBookmark = function (recipe) {
  //Add bookmark
  state.bookmarks.push(recipe);

  //Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);
  //Mark current recipe as no longer bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;
};
```

***Walkthrough finished
