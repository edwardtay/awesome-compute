FROM nginx:1.30.2-alpine@sha256:5f979dcfed4ce6461873f087e8c980d6e29b084b9e8776d9704a7e989b5f4898

COPY index.html preview.html README.md favicon.svg manifest.webmanifest /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets
COPY data /usr/share/nginx/html/data
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
