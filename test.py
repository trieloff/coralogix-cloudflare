#!/usr/local/bin/python3

import subprocess
import re
# run command `node transform.mjs` and capture the output in a regex
result = subprocess.run(['node', 'transform.mjs'], stdout=subprocess.PIPE)

# save the output as regular expression variable, drop the newline
regex = re.compile(result.stdout.decode('utf-8').rstrip(), # re.DEBUG
)

print(result.stdout.decode('utf-8'))


with open('cloudflare2.jsonc', 'r') as f:
  # save the text content of the file in a variable
  content = f.read()


  # search the content for the regex, ignoring line breaks
  match = re.search(regex, content)

  if (match):
    # print the content in white, and the matched content in red
    print(content.replace(match.group(0), '\033[1;31m' + match.group(0) + '\033[0m'))

    # print the named capture groups, if they exist as a table, values in green
    if match.groupdict():
      for key, value in match.groupdict().items():
        if value:
          print('\033[1;0m' + key + '\033[0m: \033[1;32m' + value + '\033[0m')
        else:
          print('\033[1;0m' + key + '\033[0m: \033[1;31m' + '(no value)' + '\033[0m')
  else:
    print(content)


