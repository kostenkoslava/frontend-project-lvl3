import 'bootstrap/dist/css/bootstrap-grid.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import * as yup from 'yup';
import _ from 'lodash';
import View from './View.js';

const proxy = 'hexlet-allorigins.herokuapp.com';
const schema = yup.lazy((_value, l) => yup.string().required().url('Must be a valid url!')
  .notOneOf(l, 'url is already exists'));

const parse = (data) => {
  const feedTitle = data.querySelector('channel > title').textContent;
  const feedDescr = data.querySelector('channel > description').textContent;
  const feedObj = { id: _.uniqueId(), title: feedTitle, description: feedDescr };
  const items = data.querySelectorAll('item');
  const itemsObj = Array.from(items).map((item) => {
    const description = item.querySelector('description').textContent;
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const id = _.uniqueId('item_');
    return {
      id, feedId: feedObj.id, title, description, link,
    };
  });
  return { feedObj, itemsObj };
};

const validate = (string, urlsList) => {
  try {
    schema.validateSync(string, urlsList);
    return {};
  } catch (error) {
    return { ValidationError: error.message };
  }
};

export default () => {
  const state = {
    form: {
      status: 'filling',
      error: {},
      valid: null,
    },
    loadingState: {
      status: 'inactive',
      error: {},
    },
    feeds: [],
    posts: [],
    errors: [],
  };
  const view = new View(document);
  view.watch(state);
  view.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = new FormData(e.target).get('url');
    const validated = validate(url, ['1']);
    view.watcher.form.error = validated;
    view.watcher.form.status = _.isEqual(validated, {}) ? 'valid' : 'invalid';
    view.watcher.loadingState.status = 'loading';
    const link = view.input.value;
    axios.get(`https://${proxy}/get?url=${link}`)
      .then((res) => {
        const xmlParser = new DOMParser();
        const xml = xmlParser.parseFromString(res.data.contents, 'application/xhtml+xml');
        const rss = xml.querySelector('rss');
        if (!rss) {
          throw new TypeError('This source doesn\'t contain valid rss');
        }
        return rss;
      })
      .then((rss) => {
        const { feedObj, itemsObj } = parse(rss);
        view.watcher.feeds.unshift(feedObj);
        view.watcher.posts = _.concat(itemsObj, view.watcher.posts);
        view.watcher.loadingState.status = 'finished';
        view.form.reset();
      })
      .catch((e) => {
        const { name, message } = e;
        view.watcher.loadingState.error = { [name]: message };
        view.watcher.loadingState.status = 'failed';
      });
  });
};
