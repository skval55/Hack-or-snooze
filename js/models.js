"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
    // this.favorite = currentUser.favorites.include(this) ? true : false;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    return new URL(this.url).host;
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map((story) => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, newStory) {
    if (user === localStorage.username) {
      let stry;
      let obj = {
        token: localStorage.token,
        story: {
          author: `${newStory.author}`,
          title: `${newStory.title}`,
          url: `${newStory.url}`,
        },
      };
      try {
        await $.post(
          "https://hack-or-snooze-v3.herokuapp.com/stories",
          obj,
          function (data) {
            stry = new Story(data.story);
            currentUser.ownStories.push(stry);
          }
        );
        return stry;
      } catch (error) {
        alert("url not valid");
      }
    }
  }

  // makes a delete request to the API
  async removeStory(user, storyId) {
    const token = user.loginToken;
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: { token: token },
    });

    // filter out the story whose ID we are removing
    this.stories = this.stories.filter((story) => story.storyId !== storyId);

    // do the same thing for the user's list of stories & their favorites
    user.ownStories = user.ownStories.filter((s) => s.storyId !== storyId);
    user.favorites = user.favorites.filter((s) => s.storyId !== storyId);
  }
}

// storyList
/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor(
    { username, name, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = ownStories.map((s) => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  // this function adds a story to favorites list
  static addFav(storyId) {
    const included = (story) => story.storyId === storyId;
    let story = storyList.stories.filter(included);
    story[0].favorite = true;
    currentUser.favorites.push(story[0]);
  }

  // this function removes story from favorite list
  static removeFav(storyId) {
    const included = (story) => story.storyId === storyId;
    const story = currentUser.favorites.filter(included);
    story.favorite = false;
    const index = currentUser.favorites.indexOf(story[0]);
    currentUser.favorites.splice(index, 1);
  }
  // toggles the star on and off and add story to favorite list or deletes
  static async favorite(e) {
    let storyId = e.target.parentElement.id;
    const obj = {
      token: localStorage.token,
    };
    const included = (story) => story.storyId === storyId;
    if (currentUser.favorites.some(included)) {
      await $.ajax({
        url: `https://hack-or-snooze-v3.herokuapp.com/users/${currentUser.username}/favorites/${storyId}`,
        type: "DELETE",
        data: obj,
        success: function () {
          User.removeFav(storyId);
        },
      });
    } else {
      await $.post(
        `https://hack-or-snooze-v3.herokuapp.com/users/${currentUser.username}/favorites/${storyId}`,
        obj,
        function () {
          User.addFav(storyId);
        }
      );
    }
    $(this).toggleClass("fa-regular fa-solid");
  }

  isFavorite(story) {
    return this.favorites.some((s) => s.storyId === story.storyId);
  }
}
