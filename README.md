dir-analyzer
============

This is designed to analyze files and directories. The main purpose is to
identify duplicate files and replace them with shortcuts (though replacement
feature is not developed yet).

Additionally, it will find near-duplicate images using pHash or blockhash
libraries, and perhaps use other methods to find near-duplicate files.

## Setup

On RHEL-like operating systems:

1. Run `sudo bash setup.sh`
2. Edit `config.py` with your setup
3. Run `python setup-db.py`
4. Run `python scan.py`
