import 'bootstrap/dist/css/bootstrap-grid.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import * as yup from 'yup';
import _ from 'lodash';
import View from './View.js';
import i18n from 'i18next';
import resources from './locales/index.js';
import parseRss from './parser.js'

const delay = 5000;
yup.setLocale({
  string: {
    url: 'url',
  },
  mixed: {
    notOneOf: 'notOneOf',
  }
})

const getRssData = (url) => {
  console.log(url)
  const proxy = 'https://hexlet-allorigins.herokuapp.com/get?url=';
  return axios.get(`${proxy}${url}`)
    .then((response) => parseRss(response.data.contents))
    .then(({ feedObj, postsObj }) => {
      const feed = { url, ...feedObj };
      return { feed, posts: postsObj };
    })
};

const validate = (url, urlsList) => yup.string().url().notOneOf(urlsList).validate(url);

const updateFeeds = (watchedState, delay) => {
  Promise.all(watchedState.feeds.map(({ url }) => getRssData(url)))
    .then((rssData) => {
      rssData.forEach(({ posts }, feedId) => {
        const newPosts = _.differenceWith(
          posts.map((post) => ({ feedId, ...post })),
          watchedState.posts,
          _.isEqual);
        newPosts.forEach((post) => watchedState.posts.unshift(post))
        console.log(rssData, watchedState.posts[0])
      })
    }).finally(() => {
      setTimeout(() => {
        updateFeeds(watchedState, delay);
      }, delay);
    })
}

const addHandlers = (watchedState, view, langs) => {
  view.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.url = new FormData(e.target).get('url');
    const urls = watchedState.feeds.map(({ url }) => url);
    validate(watchedState.form.url, urls)
      .then(() => {
        watchedState.form.status = 'valid';
        watchedState.form.error = null;
        watchedState.loadingState.status = 'loading';
        return getRssData(watchedState.form.url);
      })
      .then(({ feed, posts }) => {
        const id = watchedState.feeds.length;
        watchedState.feeds.unshift({ id, ...feed });
        posts.forEach((post) => watchedState.posts.unshift({ feedId: id, ...post }));
        watchedState.loadingState.status = 'finished';
        watchedState.form.status = 'filling';
        setTimeout(() => {
          updateFeeds(watchedState, delay);
        }, delay);
      })
      .catch((err) => {
        if (err.type) {
          watchedState.form.status = 'invalid';
        }
        watchedState.form.error = err.message;
      });
  });
}
const app = () => {
  const langs = ['en', 'ru']
  const state = {
    form: {
      status: 'filling',
      url: '',
      error: null,
      valid: false,
    },
    loadingState: {
      status: 'inactive',
      error: null,
    },
    lang: 'en',
    feeds: [],
    posts: [],
    message: null,
  };
  i18n.init({
    lng: state.lang,
    resources,
  }).then(() => {
    const view = new View(document, state);
    const watchedState = view.watcher;
    addHandlers(watchedState, view, langs)
  })
}
export default app;