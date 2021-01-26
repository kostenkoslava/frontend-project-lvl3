import onChange from 'on-change';

class View {
  constructor() {
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
      this.feedback.classList.add('text-success');
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
  }

  renderFeeds(feeds) {
    const titleFeeds = '<h2>Feeds</h2>';
    const feedUl = this.createCustomElement('ul', ['list-group mb-5']);
    feeds.map((f) => {
      const li = this.createCustomElement('li', ['list-group mb-5']);
      li.innerHTML = `<h3>${f.title}</h3><p>${f.description}</p>`;
      feedUl.appendChild(li);
    });
    this.feedInner.append(titleFeeds, feedUl);
  }

  renderPosts(posts) {

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
    });
  }
}
export default View;