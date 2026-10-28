FROM nginx:alpine

# Upstream services are rendered into nginx.conf at container start.
# Override these with environment variables to point at different hosts/ports.
ENV AUTH_SERVICE_URL=http://auth-service:3001 \
    STREAMING_SERVICE_URL=http://streaming-service:3003 \
    VIDEO_METADATA_SERVICE_URL=http://video-metadata-service:3002 \
    VIDEO_UPLOAD_SERVICE_URL=http://video-upload-service:3004

# Restrict envsubst to the upstream variables so nginx runtime variables
# such as $host and $http_origin are left untouched.
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx \
    NGINX_ENVSUBST_FILTER="AUTH_SERVICE_URL|STREAMING_SERVICE_URL|VIDEO_METADATA_SERVICE_URL|VIDEO_UPLOAD_SERVICE_URL"

COPY nginx/nginx.conf.template /etc/nginx/templates/nginx.conf.template
