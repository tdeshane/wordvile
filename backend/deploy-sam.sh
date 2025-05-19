#!/bin/bash
unset PAGER
unset AWS_PAGER
sam build
sam deploy --guided 