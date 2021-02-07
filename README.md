### npx tsconfig.json

Создаю тсконфиг для ноды реакт и реакт нейтив

### postgres
Открываю приложение и медленно))) ввожу postgres пароль

### mikro-orm
Смотрит что написал в entities папке и сравнивает что есть в дб, создает миграционный файл и закидывает туда инфо, которую описал в entities, как плюшка это на тайпскрипте да еще и с гкл интегрировано

npm i @mikro-orm/cli @mikro-orm/core @mikro-orm/migrations @mikro-orm/postgresql pg

// настройка кли
https://mikro-orm.io/docs/installation/#setting-up-the-commandline-tool

// create migration and push to db
npx mikro-orm migration:create
npx mikro-orm migration:up

### VSCODE

option + esc (autocomplete)
cmd + . (add import, make action)
ctrl + ` (show/hide terminal)
https://glebbahmutov.com/blog/configure-prettier-in-vscode/

в вебшторм 
option + sapce - посмотреть интерфейс
ctrl+i - реализовать опшион
ctrl+j/fn+f1 - посмотреть документацию
чтобы просто посмотреть параметры жму пробел затем option+space

### Redis
скачиваю
https://redis.io/

в папку и захожу в нее и выполняю
make

https://redis.io/topics/quickstart

sudo cp src/redis-server /usr/local/bin/
sudo cp src/redis-cli /usr/local/bin/

чтобы сделать переменные и теперь могу запустить сервер
redis-server

// в connect-redis пакеты для работы с express
npm install redis connect-redis express-session @types/redis @types/express-session @types/connect-redis

### GQL
- чтобы посмотреть креды с которыми делаю запросы
  "request.credentials": "include", (жму на шестеренку в плейграунде и сечу это)
  
### Sessions
1)
когда делаю так
 req.session!.userId = user.id;
 
2)
 {userId: 1} -> express-session посылает в редис объект с id, а редис запишет в key "sess:f6kAYoB_bzkSnuhy_AIQWB8XatZWcBlf" value = объект юзера
 
3) when user makes a request, юзер присылает qid который заинкрипчен
s%3A-RJwsdHP5gjPOeKofhAH_hchYtPVlsxA.itczDlmfxL69dajmXrW0QLYE5AKj50b3l7uyopnfK1E -> sent to the server

4) на сервере на основе ключа который указал в secret при настройке сессии декрипчу qid который прислал юзер и превращаю его в sess:f6kAYoB_bzkSnuhy_AIQWB8XatZWcBlf, дальше лезу в базу редис и узнаю  userId

В сессии обычно храним инфо которая не часто меняется у юзера, к примеру id

### next.js
сделать приложение
npx create-next-app --example with-chakra-ui-typescript web

### nodemailer
Если забыл пароль присылаю его с помощью nodemailer, могу с помощью гугл  и тд

### links

https://mikro-orm.io/docs/installation
https://github.com/expressjs/session

### Known issues

// при ошибке Type 'P' is not assignable to type 'ParamsArray'
npm update @types/express-serve-static-core --depth 1
