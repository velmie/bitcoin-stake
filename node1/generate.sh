curl --data '{"jsonrpc":"2.0","id":"curltext","method":"generate","params":[1]}' -H 'content-type:text/plain;' http://x:abacaba@127.0.0.1:48332 | json_pp
