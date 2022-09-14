if [ -z "$1" ]; then 
    echo 'Please provide a tag (e.g. yarn gcloud:deploy:server v1).'; 
    exit 125
fi

SERVER_DOCKER_NAME="tube-hub-monorepo-server";
SERVER_DOCKER_REPOSITORY_URL="gcr.io/tube-hub-1663020736781/$SERVER_DOCKER_NAME";
SERVER_DOCKER_REPOSITORY_NEW_TAG="${SERVER_DOCKER_REPOSITORY_URL}:${1}";

gcloud app deploy --image-url=$SERVER_DOCKER_REPOSITORY_NEW_TAG;