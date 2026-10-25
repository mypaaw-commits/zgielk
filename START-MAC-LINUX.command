#!/bin/sh
cd -- "$(dirname -- "$0")" || exit 1
python3 -m neslab.launch
result=$?
if [ "$result" -ne 0 ]; then
    printf '\nWymagany Python 3.12 lub nowszy: https://www.python.org/downloads/\n'
fi
exit "$result"
