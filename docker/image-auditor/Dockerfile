FROM node:16.18.1

#
# When we build the image, we copy the executable jar in the image file system. 
#
COPY src /opt/app/

WORKDIR /opt/app/
RUN npm install

EXPOSE 4242/udp
EXPOSE 2205/tcp

ENTRYPOINT ["node", "/opt/app/app.js"]