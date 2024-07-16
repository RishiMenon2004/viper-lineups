# Viper Lineups

![viper](public/banner.png)

## Introduction

I kinda made this for myself, and I never planned to let anyone use it or tweak it, but I figured I'd make it open so anyone interested can clone it and modify it for their own Valorant agent.

## Tech Stack

This is a [Vite React](https://vitejs.dev/guide/) project. You will need intermediate knowledge of the React framework.

I had decided to write this in `typescript` , it is suggested you are familiar with Ts diving into this project.

The backend uses [convex db](https://www.convex.dev/), check out the [docs](https://docs.convex.dev/).

Foundational [convex functions](https://docs.convex.dev/functions) are present to handle image uploading and deletion, and  post creation and deletion.

## Code

Again, because I didn't plan to let anyone tinker with this project, as of now my code is super messy.

Over time I will be cleaning it up and making things more readable, useable and extensible.

![progress](https://img.shields.io/badge/Clean_Up-60%25_Cleaned_Up-green?style=for-the-badge&labelColor=252429&color=0e7131)

## Development

Install and update node packages with `npm i`

Given that you have read the Convex docs, I would assume that you have run
`npx convex dev` to [initialise](https://docs.convex.dev/client/react/deployment-urls) your convex project.

> This requires you to login with your GitHub account and authorise Convex.

After you've done that run:

`npm start` to start the react development server

Start another terminal instance and run:

`npx convex dev` to start the convex server

And you're all set to go :+1:

Essentially all you'd have to do would be to edit [TagObject.ts](/src/components/Tags/TagObject.ts) and add your required tags.

## **!! READ CONVEX DOCS ON [HOSTING](https://docs.convex.dev/using/hosting) BEFORE DEPLOYING TO NETLIFY OR VERCEL !!**
