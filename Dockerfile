FROM node:16
ENV NODE_PATH /usr/local/lib/node_modules
WORKDIR /app
RUN  npm install eslint -g \ 
    && npm i rollup -g \
    && npm i rollup-plugin-terser -g