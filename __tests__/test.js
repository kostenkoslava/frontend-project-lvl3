import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';
import nock from 'nock';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/dom';
import 'regenerator-runtime';

import app from '../src/application.js';

const rssPath = path.join(__dirname, './__fixtures__/hexlet.xml');
const rssData = fs.readFileSync(rssPath, 'utf-8');
const rssUrl = 'https://ru.hexlet.io/lessons.rss';
const nonExistentUrl = 'https://nonexistenturl.ru';

const index = path.join(__dirname, '../src', 'template.html');
const initHtml = fs.readFileSync(index, 'utf-8');

const elements = {};

beforeEach(async () => {
  document.body.innerHTML = initHtml;
  await app();
  elements.input = screen.getByPlaceholderText('RSS link');
  elements.submit = screen.getByLabelText('Add');
});

test('adding', async () => {
  const scope = nock('https://api.allorigins.win')
    .get(`/${rssUrl}`)
    .reply(200, rssData);

  userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByText('RSS has been loaded')).toBeInTheDocument();
  });
  scope.done();
});

test('adding nonexistent ulr', async () => {
  const scope = nock('https://api.allorigins.win')
    .get(`/${nonExistentUrl}`)
    .reply(404);
  userEvent.type(elements.input, nonExistentUrl);
  userEvent.click(elements.submit);
  await waitFor(() => {
    expect(screen.getByText('This source doesn\'t contain valid rss')).toBeInTheDocument();
  });
  scope.done();
});

test('validation unique', async () => {
  nock('https://cors-anywhere.herokuapp.com')
    .get(`/${rssUrl}`)
    .reply(200, rssData);

  userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByText('RSS has been loaded')).toBeInTheDocument();
    expect(screen.getByText('Практические уроки по программированию')).toBeInTheDocument();
    expect(screen.getByText('Новые уроки на Хекслете')).toBeInTheDocument();
  });

  userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(screen.getByText('This url is already in the list!')).toBeInTheDocument();
  });
});

test('validation invalid url', () => {
  userEvent.type(elements.input, 'invalidUrl');
  userEvent.click(elements.submit);
  expect(screen.getByText('Must be valid url!')).toBeInTheDocument();
});
