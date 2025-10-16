# fifty-energy-coding-test-jocke

## Link to OpenAPI docs:
http://localhost:8000/api/docs

## Run the project
1. In the root directory, create an .env file with the following contents:
POSTGRES_DB=<pgname>
POSTGRES_USER=<pguser>
POSTGRES_PASSWORD=<pgpassword>

2. Open a command line tool in the root directory and run the following commands:
* make up           - Build and run containers
* make migrate      - Run database migrations
* make seed         - Populate the database
* make test         - Run unit tests

3. Go to http://localhost:3000/login to either:
* log in with pre-existing user (username: jocke, password: test123) or register a new user
* currently supported routes: /login, /register, /sensors