"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */
let myStories = false;
function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

function navStoryClick() {
  hidePageComponents();
  $storyForm.show();
  putStoriesOnPage();
}

$navLogin.on("click", navLoginClick);
$("#nav-submit").on("click", navStoryClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

// my stories section of navbar hides other parts then shows only user stories
function putUserStoriesOnPage() {
  if (currentUser.ownStories.length === 0) {
    $allStoriesList.append("<h5>No user stories yet!");
  } else {
    $allStoriesList.addClass("noNums");
    for (let story of currentUser.ownStories) {
      const $story = generateStoryMarkup(story);
      $allStoriesList.append($story);
    }
    $(".fa-star").on("click", User.favorite);
    $(".fa-trash").on("click", deleteStory);
  }
  myStories = false;
}

// this takes the event and finds the story id and plugs it into other function
async function deleteStory(evt) {
  console.debug("deleteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  // re-generate story list
  $allStoriesList.empty();
  await putUserStoriesOnPage();
}

// event listener on my stories on navbar
$("#my-stories").on("click", function () {
  myStories = true;
  hidePageComponents();
  $allStoriesList.empty();
  $allStoriesList.show();
  putUserStoriesOnPage();
});
