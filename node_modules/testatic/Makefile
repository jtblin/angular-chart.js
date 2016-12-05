check:
	jshint .
	jscs .

patch:
	npm version patch

minor:
	npm version minor

major:
	npm version major

release:
	git push
	git push --tags
	gulp build
	npm publish

release-patch: check patch release

release-minor: check minor release

release-major: check major release
