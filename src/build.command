cd ~/GitHub/fi.roomies/

DIST=public

cp -R src/resources $DIST
cp src/vendor/requirejs/require.js $DIST/require.js
cp src/vendor/jquery/dist/jquery.min.map $DIST/jquery.min.map

lessc --clean-css src/less/roomies.less > $DIST/roomies.min.css

r.js -o src/build.js
