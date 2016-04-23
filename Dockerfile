FROM jtblin/debian-node-graphicsmagick:stretch-node-v4.4.3-gm-v1.3.23
WORKDIR /src
ADD . ./
RUN chown -R node:node /src
USER node
RUN npm install && npm install bower && ./node_modules/bower/bin/bower install
CMD ["npm", "test"]
