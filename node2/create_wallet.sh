id='foo'
passphrase='bar'
witness='false'
accountKey='tpubDDh2XgSds1vBbeVgye88gsGQeCityoywRndtyrXcmvWqCgsFUyUKwzeDv8HiJhu9fC8jRAFMqxr4jj8eRTNTycmMao5wmsAScVf4jSMdPYZ'
./bcoin/bin/bcoin cli wallet create $id --witness=$witness --passphrase=$passphrase --watch=$watchOnly --key=$accountKey --config ./data/bcoin.conf
