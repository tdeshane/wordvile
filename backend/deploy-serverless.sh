#!/bin/bash
unset PAGER
unset AWS_PAGER
export ADMIN_TOKEN=changeme # <-- set your real token here or in your shell
npx serverless deploy
npx serverless info 