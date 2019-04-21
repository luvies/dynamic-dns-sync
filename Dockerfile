FROM node:10-alpine as build

WORKDIR /build
COPY . .

RUN yarn
RUN yarn build

RUN cp package.json yarn.lock dist/
WORKDIR /build/dist
RUN yarn --prod

FROM node:10-alpine as final

WORKDIR /app
COPY --from=build /build/dist .

ENTRYPOINT [ "node", "index.js" ]
