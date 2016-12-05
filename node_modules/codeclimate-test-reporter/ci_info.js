module.exports = {
  getInfo: function() {
    var env = process.env;

    if (env.TRAVIS) {
      return {
        name: "travis-ci",
        branch: env.TRAVIS_BRANCH,
        build_identifier: env.TRAVIS_JOB_ID,
        pull_request: env.TRAVIS_PULL_REQUEST
      };
    } else if (env.CIRCLECI) {
      return {
        name:             "circleci",
        build_identifier: env.CIRCLE_BUILD_NUM,
        branch:           env.CIRCLE_BRANCH,
        commit_sha:       env.CIRCLE_SHA1
      };
    } else if (env.SEMAPHORE) {
      return {
        name:             "semaphore",
        branch:           env.BRANCH_NAME,
        build_identifier: env.SEMAPHORE_BUILD_NUMBER
      };
    } else if (env.JENKINS_URL) {
      return {
        name:             "jenkins",
        build_identifier: env.BUILD_NUMBER,
        build_url:        env.BUILD_URL,
        branch:           env.GIT_BRANCH,
        commit_sha:       env.GIT_COMMIT
      };
    } else if (env.TDDIUM) {
      return {
        name:             "tddium",
        build_identifier: env.TDDIUM_SESSION_ID,
        worker_id:        env.TDDIUM_TID
      };
    } else if (env.WERCKER) {
      return {
        name:               "wercker",
        build_identifier:   env.WERCKER_BUILD_ID,
        build_url:          env.WERCKER_BUILD_URL,
        branch:             env.WERCKER_GIT_BRANCH,
        commit_sha:         env.WERCKER_GIT_COMMIT
      };
    } else if (env.CI_NAME && env.CI_NAME.match(/codeship/i)) {
      return {
        name:             "codeship",
        build_identifier: env.CI_BUILD_NUMBER,
        build_url:        env.CI_BUILD_URL,
        branch:           env.CI_BRANCH,
        commit_sha:       env.CI_COMMIT_ID
      };
    } else if (env.APPVEYOR) {
      return {
        name:             "appveyor",
        build_identifier: env.APPVEYOR_BUILD_NUMBER,
        branch:           env.APPVEYOR_REPO_BRANCH,
        commit_sha:       env.APPVEYOR_REPO_COMMIT,
        pull_request:     env.APPVEYOR_PULL_REQUEST_NUMBER
      };
    } else if (env.BUILDKITE) {
      return {
        name:             "buildkite",
        build_identifier: env.BUILDKITE_BUILD_ID,
        build_url:        env.BUILDKITE_BUILD_URL,
        branch:           env.BUILDKITE_BRANCH,
        commit_sha:       env.BUILDKITE_COMMIT
      };
    } else {
      return {};
    }
  }
};
