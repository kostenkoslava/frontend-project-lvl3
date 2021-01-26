setup:
	npm install
install:
	npm ci
	sudo npm link
publish:
	npm publish --dry-run
lint:
	npx eslint .

test:
	npm test
test-coverage:
	npm test -- --coverage --coverageProvider=v8