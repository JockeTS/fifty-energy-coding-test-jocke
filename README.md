# fifty-energy-coding-test-jocke
1. In the root directory, create a .env file with the following contents:
POSTGRES_DB=<pgname>
POSTGRES_USER=<pguser>
POSTGRES_PASSWORD=<pgpassword>

2. Open a command line tool in the root directory and run the following commands:
* make up           - Build and run containers
* make migrate      - Run database migrations
* make seed         - Populate the database