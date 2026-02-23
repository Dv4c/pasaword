### Установка (Linux & Windows)

Перед началом установки убедитесь что находитесь внутри папки, куда хотите сохранить (win: dir, linux: ls):

git clone git@github.com:Dv4c/pasaword.git

cd pasaword

npm run setup

pasaword

--------------------

Possible error: user/bin/pasaword: Permission denied

chmod +x dist/index.js && sudo npm link
