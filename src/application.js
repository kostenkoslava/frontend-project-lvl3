/* eslint no-param-reassign: ["error", { "props": false }] */

import 'bootstrap/js/dist/modal.js';
import axios from 'axios';
import * as yup from 'yup';
import _ from 'lodash';
import i18n from 'i18next';
import View from './View.js';
import resources from './locales/index.js';
import parseRss from './parser.js';

const delay = 5000;

yup.setLocale({
  string: {
    url: 'url',
  },
  mixed: {
    notOneOf: 'notOneOf',
  },
});

const getRssData = (url) => {
  const proxy = 'https://api.allorigins.win/get?url=';
  return axios.get(`${proxy}${url}`)
    .then((response) => parseRss(response.data.contents))
    .then(({ feed, posts }) => ({ feed: ({ url, ...feed }), posts }));
};

const validate = (url, urlsList) => yup.string().url().notOneOf(urlsList).validate(url);

const updateFeeds = (watchedState) => {
  Promise.all(watchedState.feeds.map(({ url }) => getRssData(url)))
    .then((rssData) => {
      rssData.forEach(({ posts }, feedId) => {
        const newPosts = _.differenceWith(
          posts.map((post) => ({ feedId, ...post })),
          watchedState.posts,
          (a, b) => a.title === b.title,
        );
        newPosts.forEach((post) => watchedState.posts.unshift(post));
      });
    }).finally(() => {
      setTimeout(() => {
        updateFeeds(watchedState);
      }, delay);
    });
};

const addHandlers = (watchedState, view) => {
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
          updateFeeds(watchedState);
        }, delay);
      })
      .catch((err) => {
        if (err.type) {
          watchedState.form.status = 'invalid';
          watchedState.form.error = err.type;
          return;
        }
        watchedState.form.error = err.message;
      });
  });
  document.addEventListener('click', (e) => {
    const { toggle, id } = e.target.dataset;
    if (toggle !== 'modal') return;
    const currentPost = watchedState.posts.find(({ id: postId }) => postId === id);
    if (!currentPost) return;
    watchedState.modalItem = currentPost;
    watchedState.readPosts = {
      ...watchedState.readPosts,
      [id]: true,
    };
  });
};

const app = () => {
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
    readPosts: {},
    modalItem: null,
  };
  i18n.init({
    lng: state.lang,
    resources,
  }).then(() => {
    const view = new View(document, state);
    const watchedState = view.watcher;
    addHandlers(watchedState, view);
  });
};
export default app;
