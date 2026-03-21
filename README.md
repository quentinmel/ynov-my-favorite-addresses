# My Favorite Addresses app

This is a demo app to work arround tests and CI, you should clone this repo, remove the `.git` folder and push it to your own public repo!

The client folder is empty, you may create an interface to communicate with the server! This is kind of a bonus

## Run locally

Install dependencies:

```bash
cd server
npm install

cd ../client
npm install
```

Start the server (default port 3000):

```bash
cd server
npm run dev
```

Start the client (port 5174 is used by Playwright config):

```bash
cd client
npm run dev -- --port 5174
```

Run end-to-end tests:

```bash
cd client
npm run test:e2e
```
