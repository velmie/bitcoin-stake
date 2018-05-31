import leveldb

db = leveldb.LevelDB('./data/chain.ldb')

db.Put('hello', 'value')
db.Put('world', 'value')

for k, v in db.RangeIter(include_value = True):
  print k.encode('hex'), v.encode('hex')
