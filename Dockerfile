FROM nginx:1.27-alpine

COPY index.html preview.html README.md favicon.svg manifest.webmanifest /usr/share/nginx/html/

EXPOSE 80
