//Imports everything from model.js to make all the exports (model.state & model.loadRecipe)
import * as model from './model.js';
import recipeView from './views/recipeView';

//For polyfilling all except Async/Await
import 'core-js/stable';
//For polyfilling Async/Await
import 'regenerator-runtime/runtime';

const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    console.log(id);

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

const init = function () {
  recipeView.addHandlerRender(controlRecipes);
};
init();
