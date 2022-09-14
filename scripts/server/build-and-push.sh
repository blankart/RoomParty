if [ -z "$2" ]; then 
    echo 'Please provide a tag (e.g. yarn docker:push v1).'; 
    exit 125
fi

SERVER_DOCKER_NAME="tube-hub-monorepo-server";
SERVER_DOCKER_REPOSITORY_URL="gcr.io/tube-hub-1663020736781/$SERVER_DOCKER_NAME";
SERVER_DOCKER_REPOSITORY_NEW_TAG="${SERVER_DOCKER_REPOSITORY_URL}:${2}";

COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose --env-file $1 -f docker-compose.yml build --parallel;
docker tag $SERVER_DOCKER_NAME $SERVER_DOCKER_REPOSITORY_NEW_TAG;
docker push $SERVER_DOCKER_REPOSITORY_NEW_TAG;