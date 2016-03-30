desdrive
========

Install
-------

```bash
git clone https://github.com/jamesmontalvo3/desdrive
cd desdrive
npm install
cp config.example.json config.json
vi config.json # edit this accordingly
node setup.js
```

Use it
------

Optionally mount another server:

```bash
sudo bash mount-server.sh
```

Then tell desdrive to analyze everything within a certain path:

```bash
node run.js /path/to/directory/to/analyze
```

For now the only way to consume the data generated is via direct SQL queries. Sorry.
