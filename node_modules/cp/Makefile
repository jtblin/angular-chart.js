
BIN := node_modules/.bin
NODE ?= node
SRC = $(wildcard *.js)
TEST = $(wildcard test/*.js)

test: NODE=$(BIN)/gnode
test: node_modules
	$(NODE) $(BIN)/_mocha \
	  --reporter spec \
	  --require co-mocha \
	  $(NODE_FLAGS)

# coverage only available on 0.11
coverage: node_modules $(SRC) $(TEST)
	$(NODE) --harmony-generators $(BIN)/istanbul cover \
	  $(BIN)/_mocha -- \
	    --require co-mocha \
	    --reporter spec

node_modules: package.json
	@npm install
	@touch $@

clean:
	@rm -rf coverage test/fixtures/*copy*

.PHONY: test clean
