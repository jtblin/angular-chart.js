FROM jtblin/debian-node-graphicsmagick:stretch-node-v4.4.7-gm-v1.3.24
WORKDIR /src
ADD . ./
RUN chown -R node:node /src
USER node
RUN npm install
CMD ["npm", "test"]
