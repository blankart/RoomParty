./scripts/server/build-and-push.sh $1 $2;
ret_code=$?
if [ $ret_code > 0 ]; then 
    exit $ret_code;
fi
./scripts/server/gcloud-deploy-server.sh $2;