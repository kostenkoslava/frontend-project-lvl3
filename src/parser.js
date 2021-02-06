import _ from 'lodash';

export default (data) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(data, 'text/xml');
  const rss = xml.querySelector('rss');
  if (!rss) {
    throw new Error('notContain');
  }
  const feedTitleElement = rss.querySelector('channel > title');
  const feedDescrElement = rss.querySelector('channel > description');
  const feed = {
    title: feedTitleElement.textContent,
    description: feedDescrElement.textContent,
  };
  const items = rss.querySelectorAll('item');
  const posts = Array.from(items).map((item) => ({
    title: item.querySelector('title').textContent,
    link: item.querySelector('link').textContent,
    description: item.querySelector('description').textContent,
    id: _.uniqueId(),
  }));
  return { feed, posts };
};
