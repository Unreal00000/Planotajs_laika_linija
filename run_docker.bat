docker build -t planner-app .
docker run -p 3000:3000 --name planner planner-app
docker start -a planner
