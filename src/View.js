import onChange from 'on-change';
import i18next from 'i18next';
import _ from 'lodash';

class View {
  constructor(document, state) {
    this.body = document.body;
    this.form = document.querySelector('.rss-form');
    this.feedsBox = document.querySelector('.feeds');
    this.postsBox = document.querySelector('.posts');
    this.feedback = document.querySelector('.feedback');
    this.input = document.querySelector('.form-control');
    this.submit = document.querySelector('[type="submit"]');
    this.feedsHeader = document.createElement('h2');
    this.feedsHeader.textContent = i18next.t('headers.feed');
    this.feedsUl = document.createElement('ul');
    this.feedsUl.classList = 'list-group my-2';
    this.postsHeader = document.createElement('h3');
    this.postsHeader.textContent = i18next.t('headers.posts');
    this.postsUl = document.createElement('ul');
    this.postsUl.className = 'list-group my-2';
    this.modalBody = document.querySelector('[data-role="modal-body"]');
    this.modalTitle = document.querySelector('[data-role="modal-title"]');
    this.modalLink = document.querySelector('[data-role="modal-link"]');
    this.watcher = onChange(state, (path, value, previousValue) => {
      if (path === 'form.status') {
        this.statusFormHandler(value);
      }
      if (path === 'form.error') {
        this.renderFeedback(value);
      }
      if (path === 'loadingState.error') {
        this.renderFeedback(value);
      }
      if (path === 'loadingState.status') {
        this.statusLoadingHandler(value);
      }
      if (path === 'feeds') {
        if (_.isEmpty(previousValue)) {
          this.initList();
        }
        this.renderFeeds(_.differenceWith(value, previousValue, _.isEqual));
      }
      if (path === 'posts') {
        this.renderPosts(_.differenceWith(value, previousValue, _.isEqual));
      }
      if (path === 'modalItem') {
        this.renderModal(value);
      }
      if (path === 'readPosts') {
        this.renderRead(value);
      }
    });
  }

  initList() {
    this.feedsBox.append(this.feedsHeader, this.feedsUl);
    this.postsBox.append(this.postsHeader, this.postsUl);
  }

  renderFeedback(text) {
    if (text === 'added') {
      this.feedback.classList.add('text-info');
      this.feedback.innerHTML = i18next.t(text);
    } else {
      this.feedback.textContent = i18next.t(`errors.${text}`);
      this.feedback.classList.add('text-danger');
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
      this.form.reset();
    }
    if (loadingStatus === 'finished') {
      this.form.reset();
      this.submit.disabled = false;
      this.renderFeedback('added');
    }
  }

  renderFeeds(feeds) {
    feeds.forEach((f) => {
      const li = document.createElement('li');
      li.classList = 'list-group-item list-group-item-dark lead font-weight-bolder';
      li.innerHTML = `<h3>${f.title}</h3><p>${f.description}</p>`;
      this.feedsUl.prepend(li);
    });
  }

  renderPosts(posts) {
    const html = posts.map((post) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center ';
      const postLink = document.createElement('a');
      postLink.className = 'list-group-item list-group-item-action font-weight-bold';
      postLink.textContent = post.title;
      postLink.href = post.link;
      postLink.rel = 'noopener noreferrer';
      postLink.target = '_blank';
      postLink.dataset.post = post.id;
      const previewBtn = document.createElement('button');
      previewBtn.className = 'btn btn-primary ml-4';
      previewBtn.dataset.id = post.id;
      previewBtn.dataset.target = '#modal';
      previewBtn.dataset.toggle = 'modal';
      previewBtn.type = 'button';
      previewBtn.textContent = i18next.t('buttons.preview');
      li.append(postLink, previewBtn);
      return li;
    });
    this.postsUl.prepend(...html);
  }

  renderModal({ description, title, link } = {}) {
    this.modalBody.textContent = description;
    this.modalTitle.textContent = title;
    this.modalLink.setAttribute('href', link);
  }

  renderRead(value) {
    const id = _.first(Object.keys(value));
    const readPost = this.postsBox.querySelector(`[data-post="${id}"]`);
    console.log(Object.entries(readPost), readPost);
    readPost.classList.remove('font-weight-bold');
    readPost.classList.add('font-weight-normal');
  }
}
export default View;
