#!/bin/bash

if [ -n "$SKIP" ]; then
  exit 0
fi

current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ]; then
  echo "Not on 'main' branch. Skipping post-commit hook."
  exit 0
fi

command -v git-lfs >/dev/null 2>&1 || {
  printf >&2 "\nThis repository is configured for Git LFS but 'git-lfs' was not found on your path. If you no longer wish to use Git LFS, remove this hook by deleting the 'post-commit' file in the hooks directory (set by 'core.hookspath'; usually '.git/hooks').\n"
  exit 2
}
git lfs post-commit "$@"

command -v npx >/dev/null 2>&1 || {
  printf >&2 "\nnpx is missing.\n"
  exit 2
}
npx quartz build --verbose -o sites

# find all pdf files and remove them
find sites -type f -name "*.pdf" -print0 | xargs -0 rm -f

npm run vendorred

current_datetime=$(date +"%Y-%m-%d %H:%M:%S")
pushd sites &>/dev/null || exit 1
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -sv --message "chore: build at $current_datetime [generated]"
  git push origin main
else
  echo "No changes detected. Skipping commit and push."
fi
popd &>/dev/null || exit 1
