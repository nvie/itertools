#!/bin/sh
set -e

# The output directory for the package build
ROOT="$(git rev-parse --show-toplevel)"

# Work from the root folder, build the dist/ folder
cd "$ROOT"

usage () {
    echo "publish.sh [-t <tag>]" >&2
    echo "" >&2
    echo "<tag>      The NPM tag to use (default: latest)" >&2
    exit 2
}

TAG=latest
while getopts V:t:h flag; do
    case "$flag" in
        t) TAG=$OPTARG;;
        *) usage; exit 2;;
    esac
done
shift $(($OPTIND - 1))

if [ "$#" -ne 0 ]; then
    err "Unknown arguments: $@"
    usage
    exit 2
fi

# Check we're on the main branch
if [ "$TAG" = "latest" -a "$(git current-branch)" != "main" ]; then
    echo "Must be on \"main\" branch to publish latest version to NPM." >&2
    exit 2
fi

# Update to latest version
git fetch

if [ "$TAG" = "latest" -a "$(git sha main)" != "$(git sha origin/main)" ]; then
    echo "Not up to date with origin.  Please pull/push latest changes before publishing." >&2
    exit 3
fi

if [ "$TAG" = "latest" ] && git is-dirty; then
    echo "There are local changes.  Please commit those before publishing." >&2
    exit 4
fi

npm run test

# Read the version from the package.json file, we don't need to re-enter it
GITHUB_URL="$(cat package.json | jq -r .githubUrl)"

if [ -z "$GITHUB_URL" -o "$GITHUB_URL" = "null" ]; then
    echo 'Please specify `githubUrl` in package.json.' >&2
    exit 5
fi

VERSION="$(cat package.json | jq -r .version)"

if git is-dirty; then
    if [ "$TAG" = "latest" ]; then
        git commit -m "Bump to $VERSION" package.json
        git tag "v$VERSION"
        git push-current
        git push --tags
    fi
fi

npm run build
npm publish --tag "$TAG"

# Open browser tab to create new release
open "${GITHUB_URL}/blob/v${VERSION}/CHANGELOG.md"
open "${GITHUB_URL}/releases/new?tag=v${VERSION}&title=v${VERSION}&body=TODO%3A%20Copy%20release%20notes%20from%20CHANGELOG."
