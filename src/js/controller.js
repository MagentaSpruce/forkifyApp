//Imports everything from model.js to make all the exports (model.state & model.loadRecipe)
import * as model from './model.js';
import recipeView from './views/recipeView';
import searchView from './views/searchView';
import resultsView from './views/resultsView';

//For polyfilling all except Async/Await
import 'core-js/stable';
//For polyfilling Async/Await
import 'regenerator-runtime/runtime';

if (module.hot) {
  module.hot.accept();
}

// https://forkify-api.herokuapp.com/v2

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    // console.log(id);

    if (!id) return;
    recipeView.renderSpinner();
    //1) Loading recipe - waiting for data from the model. loadRecipe is async, so must await.
    //.loadRecipe(id) gives access to state.recipe
    await model.loadRecipe(id);

    //2) Rendering recipe once the data from loadRecipe() is available
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // 1) get search query
    const query = searchView.getQuery();
    if (!query) return;

    //2) Load search results
    await model.loadSearchResults(query);

    //3) Render results
    // console.log(model.state.search.results);
    // resultsView.render(model.state.search.results);
    // console.log(model.getSearchResultsPage(1));
    resultsView.render(model.getSearchResultsPage());
  } catch (err) {
    console.log(err);
  }
};

const init = function () {
  recipeView.addHandlerRender(controlRecipes);
  searchView.addHandlerSearch(controlSearchResults);
};
init();
