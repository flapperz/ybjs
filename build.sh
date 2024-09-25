# echo '{ "main": "hello.js", "output": "sea-prep.blob" }' > sea-config.json
source .env.build

BUILD_DIR='build'
CLI_PATH=${BUILD_DIR}/${CLI_NAME}
echo "Building to ${CLI_PATH}"

node --experimental-sea-config sea-config.json
cp $(command -v node) $CLI_PATH
codesign --remove-signature $CLI_PATH

npx postject $CLI_PATH NODE_SEA_BLOB $BUILD_DIR/sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA b2

codesign --sign - $CLI_PATH