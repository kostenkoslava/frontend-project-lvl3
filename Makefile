develop:
	npx webpack-dev-server

install:
	npm install

build:
	NODE_ENV=production npx webpack

lint:
	npx eslint .

test:
	npm test
test-coverage:
	npm test -- --coverage --coverageProvider=v8