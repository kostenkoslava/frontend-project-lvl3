import onChange from 'on-change';

class View {
  constructor(document) {
    this.form = document.querySelector('.rss-form');
    this.feedsBox = document.querySelector('.feeds');
    this.postsBox = document.querySelector('.posts');
    this.feedback = document.querySelector('.feedback');
    this.input = document.querySelector('input');
    this.submit = document.querySelector('[type="submit"]');
  }

  renderFeedback(error, successMessage = null) {
    this.clearFeedback();
    const errorType = Object.keys(error)[0];
    if (errorType) {
      this.feedback.innerHTML = error[errorType];
      this.feedback.classList.add('text-danger');
    }
    if (successMessage) {
      this.feedback.classList.add('text-info');
      this.feedback.innerHTML = successMessage;
    }
  }

  clearFeedback() {
    this.feedback.classList.remove('text-success', 'text-danger');
    this.feedback.innerHTML = '';
  }

  statusFormHandler(formStatus) {
    this.input.classList.remove('is-invalid');
    if (formStatus === 'invalid') {
      this.input.classList.add('is-invalid');
    } else {
      this.clearFeedback();
    }
  }

  statusLoadingHandler(loadingStatus) {
    if (loadingStatus === 'loading') {
      this.submit.disabled = true;
    }
    if (loadingStatus === 'failed') {
      this.submit.disabled = false;
    }
    if (loadingStatus === 'finished') {
      this.submit.disabled = false;
      this.renderFeedback({}, 'Rss has been added');
    }
  }

  renderFeeds(feeds) {
    const titleFeeds = document.createElement('h2');
    titleFeeds.textContent = 'Feeds';
    const feedUl = document.createElement('ul');
    feedUl.classList.add('list-group', 'mb-5');
    feeds.map((f) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item');
      li.innerHTML = `<h3>${f.title}</h3><p>${f.description}</p>`;
      feedUl.prepend(li);
    });
    this.feedsBox.append(titleFeeds, feedUl);
  }

  renderPosts(posts) {
    const h3 = document.createElement('h3');
    h3.textContent = 'Posts';
    const ul = document.createElement('ul');
    const classes = ['list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start'];
    const html = posts.map(({ id, link, title }) => {
      const li = document.createElement('li');
      const href = `<a href=${link} class="font-weight-bold" data-id="${id}" target="_blank" rel="noopener noreferrer">${title}</a>`;
      const button = `<button type="button" class="btn btn-primary btn-sm" data-id="${id}" data-toggle="modal" data-target="#modal">Preview</button>`;
      li.classList.add(...classes);
      li.innerHTML = ([href, button].join(' '));
      return li;
    });
    ul.prepend(...html);
    this.postsBox.append(h3, ul);
  }

  watch(state) {
    this.watcher = onChange(state, (path, value) => {
      if (path === 'form.status') {
        this.statusFormHandler(value);
      }
      if (path === 'form.error' || path === 'loadingState.error') {
        this.renderFeedback(value);
      }
      if (path === 'loadingState.status') {
        this.statusLoadingHandler(value);
      }
      if (path === 'feeds') {
        this.renderFeeds(value);
      }
      if (path === 'posts') {
        this.renderPosts(value);
      }
    });
  }
}
export default View;
