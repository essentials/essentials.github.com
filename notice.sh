#!/bin/bash

IFS=$'\n';

cd wiki.ess3.net

for f in `find|grep html`; do

	if [[ $f == "./cfg/index.html" ]]; then
		cat > $f << EOF
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="refresh" content="0; url=https://github.com/essentials/Essentials/blob/2.x/Essentials/src/config.yml"/>
	</head>
	<body>
		Please click <a href="https://github.com/essentials/Essentials/blob/2.x/Essentials/src/config.yml">if you aren't redirected</a>
	</body>
</html>
EOF
	else
		for line in `cat $f`; do
			echo $line >> ${f}.new
			if [[ $line == *\"content\"* ]]; then
				cat ../header >> ${f}.new
			fi
		done
	mv ${f}.new $f
	fi
done
