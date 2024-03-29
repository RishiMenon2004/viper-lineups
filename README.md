# Viper Lineups

![viper](public/banner.png)

## Introduction

I kinda made this for myself, and I never planned to let anyone use it or tweak it, but I figured I'd make it open so anyone interested can clone it and modify it for their own Valorant agent.

## Tech Stack

This is a [`create-react-app`](https://reactjs.org/docs/getting-started.html) project. You will need intermediate knowledge of the React framework.

I had decided to write this in `typescript` , so please be familiarised with it's little kinks and typing before diving into this.

I use [convex.dev](https://www.convex.dev/) for my backend, so make sure to check out the [docs](https://doc.convex.dev/) before messing with the backend.

I have created a few [convex functions](https://docs.convex.dev/using/writing-convex-functions) to handle image uploading/deleting and post creation/deletion. Feel free to add your own as needed once you're comfortable with Convex.

The database has 1 table(s)  `posts`

1. The `posts` table is structured as shown below

| title    | body     | images                                              | map      | side                                | abilities                             |
|---       |---       |---                                                  |---       |---                                  |---                                    |
| `string` | `string` | `{ url:string, storageId:string, cover:boolean }[]` | `string` | `{ id:string, displayText:string }` | `{ id:string, displayText:string }[]` |

## Code

Again, because I didn't plan to let anyone tinker with this project, as of now my code is super messy.

Over time I will be cleaning it up and making things more readable, useable and extensible.

![progress](https://img.shields.io/badge/Clean_Up-60%25_Cleaned_Up-green?style=for-the-badge&labelColor=252429&color=0e7131)

## Development

Given that you have read the Convex docs, I would assume that you have both cloned this repository and have run
`$ npx convex init` to [initialise](https://docs.convex.dev/quickstart#configure-the-client-and-wire-up-the-provider) your convex project.

> This requires you to login with your GitHub account and authorise Convex.

After you've done that, you'll need to start two terminal sessions and run one of these commands in each

1. `$npm start`

2. `$npx convex dev`

And you're all set to go :+1:

Essentially all you'd have to do would be to edit the [TagObject.ts](/src/components/Tags/TagObject.ts) file and add your required tags.

## **READ CONVEX DOCS ON [HOSTING](https://docs.convex.dev/using/hosting) BEFORE DEPLOYING TO NETLIFY OR VERCEL**
