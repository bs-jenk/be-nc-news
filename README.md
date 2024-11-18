# Northcoders News API

Welcome to the repo for my backend API project 'Northcoders News' which is now hosted using Supabase and Render. 

Find the hosted API here: https://be-nc-news-c6su.onrender.com/api

This API has been built to serve a Reddit-style web app called NC News which allows users to find, read, vote, and comment on news articles sorted by various topics.

## Minimum requirements:

Built using:

* Node.js v22.6.0
* Postgres 14.13

## How to utilise this repo:

In order to clone and run this repo locally use the following steps:

1. Navigate to the directory you want to clone the repo to:

```js
cd <directory_name>
```

2. Clone the repository

```js
git clone https://github.com/bs-jenk/be-nc-news.git
```

3. Install the dependencies

```js
npm install
```

4. Create .env files

You will need to create two .env files (".env.test" and ".env.developement") to allow the PGDATABASE envrionmental variable to be set to the correct database in the connection.js file. 
  
In the .env.development file, write the following line of code:

```js
PGDATABASE=nc_news
```

In the .env.test file write:

```js
PGDATABASE=nc_news_test
```

5. Create and seed the local databases

```js
npm run setup-dbs
npm run seed
```

6. Check everything is working correctly by running the test suites

```js
npm run test
```

All tests should pass!

--- 

This portfolio project was created by Sam Jenkinson as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
