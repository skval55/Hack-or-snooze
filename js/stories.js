"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let favoriteStories;
/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      <i class="fa-regular fa-star"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $("i").click(User.favorite);
  $allStoriesList.show();
}

// story submit form
async function submitStory(e) {
  console.log(currentUser);
  e.preventDefault();
  for (let input of $("#story-form input")) {
    console.log(input);
    console.log(input.value);
    if (input.value === "") {
      alert(`Enter ${input.placeholder}`);
      return;
    }
  }
  let storyObj = {
    title: `${$("#title").val()}`,
    author: `${$("#author").val()}`,
    url: `${$("#url").val()}`,
  };
  for (let input of $("#story-form input")) {
    input.value = "";
  }
  console.log(currentUser.username, storyObj);
  await storyList.addStory(currentUser.username, storyObj);
  $storyForm.hide();

  storyList = await StoryList.getStories();
  putStoriesOnPage();
}

$("#story-form button").on("click", submitStory);

async function favorites(e) {
  $storyForm.hide();
  e.preventDefault();
  $allStoriesList.empty();
  favorites = await currentUser.favorites;

  for (let story of favorites) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $("i").click(User.favorite);
}

$("#nav-fav").on("click", favorites);
$("#my-stories").on("click", function () {
  $allStoriesList.empty();
  for (let story of currentUser.ownStories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $("i").click(User.favorite);
});
