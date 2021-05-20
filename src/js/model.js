import { async } from 'regenerator-runtime';
import { API_URL } from './config.js';
import { getJSON } from './helpers';
import recipeView from './views/recipeView.js';

export const state = {
  recipe: {},
};

//Pulls data from Forkify API, then sends data to export state which then sends it to the controller where it is used for rendering
export const loadRecipe = async function (id) {
  try {
    const data = await getJSON(`${API_URL}/${id}`);
    // const res = await fetch(`${API_URL}/${id}`);
    // const data = await res.json();
    // console.log(res, data);
    // if (!res.ok) throw new Error(`${data.message}(${res.status})`);

    const { recipe } = data.data;
    state.recipe = {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceURL: recipe.sourceURL,
      image: recipe.image_url,
      servings: recipe.servings,
      cookingTime: recipe.cooking_time,
      ingredients: recipe.ingredients,
    };
    console.log(state.recipe);
  } catch (err) {
    //Temp error handler
    console.error(`err 👻`);
    recipeView.renderError();
    throw err;
  }
};
