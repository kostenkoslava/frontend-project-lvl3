import 'bootstrap/dist/css/bootstrap-grid.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import * as yup from 'yup';
import View from './View.js';
import _ from 'lodash';

const proxy = 'hexlet-allorigins.herokuapp.com';
const schema = yup.lazy((_value, l) => {
  return yup.string().required().url('Must be a valid url!')
    .notOneOf(l, 'url is already exists');
})

const parse = (data) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(data, 'application/xml');
  const rss = parsedData.getElementsByTagName('rss');
  if (rss.length === 0) {
    throw new Error('This source doesn\'t contain valid rss');
  }
  return rss;
};

const validate = (string, urlsList) => {
  try {
    schema.validateSync(string, urlsList);
    return {};
  } catch (error) {
    return { ValidationError: error.message }
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
  const view = new View();
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
      .catch((e) => {
        const { name, message } = e;
        view.watcher.loadingState.error = { [name]: message };
        view.watcher.loadingState.status = 'failed';
      });



    // validate(link)
    //   .then((l) => {
    //     return axios.get(`https://${proxy}/get?url=${link}`)
    //       .then((r) => parse(r.data.contents))
    //   })
    //   .then((validData) => {
    //     const feedTitle = validData[0].querySelector('title');
    //     const feedDescription = validData[0].querySelector('description');
    //     const feedObj = { id: _.uniqueId(), title: feedTitle, description: feedDescription };
    //     watchState.feeds.push(feedObj);
    //   })
    //   .catch((e) => {
    //     console.log(e, -1)
    //   })

  });

};
