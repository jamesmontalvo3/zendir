dir-analyzer
============

This is designed to analyze files and directories on Windows. The main purpose
is to identify duplicate files and replace them with shortcuts. 

Additionally, it will be used to identify images in a directory which already
exist within an image repository. The image repository will provide an API to
identify 

## Requirements

1. Python
2. PostgreSQL
3. Psycopg (PostreSQL adapter for Python) http://www.initd.org/psycopg/

## Setup

**Note, these setup procedures are deliberately very detailed for educational
purposes.** For instructions on setting up Python, PostgreSQL and Psycopg, see 
[environment setup](ENVIRONMENTSETUP.md)

To setup your database start the PostgreSQL command line utility by doing the
following in the Windows command line:
```
C:\Progra~1\PostgreSQL\9.2\bin\psql.exe --username=postgres
```

Enter the password you chose for the user "postgres" during PostgreSQL setup.

Once running PostgreSQL, enter the following SQL commands to create your
username and password. We're creating a new user here because you want to limit
the  *Note: make sure to replace "myusername" and
"mypassword" with whatever you prefer*:
```SQL
CREATE ROLE myusername PASSWORD 'mypassword' NOSUPERUSER CREATEDB NOCREATEROLE INHERIT LOGIN;
```

Now run the following SQL command to create your database. Again, replace
"mydatabase" and "myusername" with your own values.
```SQL
CREATE DATABASE mydatabase OWNER myusername;
```

Last, create a file in your dir-analyzer directory called "config.py" with the 
following content. Replace dbname, username and password with the values you 
chose, and enter the path to the directory you are planning on analyzing.
```Python
database = dict(
	dbname = 'mydatabase',
	username = 'myusername',
	password = 'mypassword')

directoryToAnalyze = 'C:\\path\\to\\directory'
```