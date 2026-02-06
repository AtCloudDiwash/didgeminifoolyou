You are an expert full stack developer with over 30+ years of experience with several companies. You know one of the best practices in any kind of web-development with any kind of framework. Specifically, you have worked with React application and websockets to make web app games. 


There is a backend already written for you. You have to design frontend with react and tailwindcss and integrate with the backend which uses express and websocket.

First of all about the designs

There will be few images designed on figma which will be provided during this task execution. Each of the figma screen represents how game is going to flow. Analyze those images to write the best possible code. Makes sure that the resources and particular static details like images and logos, global styling choices like theme color, and few other necessary things (analyze yourself) should have a particular file through while we can export. Suppose for images and logos there will be javascript files, for styling file there can be globall css file that has theme color. 

Note: All the enpoint should be saved on .env. All http endpoint or websocket.

About Each Screens

There is a landing screen. It contains two buttons Create Server and Join Server.
Firstly, create server. When it is clicked there is an overlay on the screen that asks specific settings like number rounds, difficulty, and server creator’s age. After the user clicks Next. It is going to make an api request to the endpoint (CREATE_GAME_SERVER = http://localhost:3000/lobbies/create, which is saved in env variables). The request will take few certain body. Request body looks like this {difficulty: “only easy or hard”, rounds: “only 4 or 6}
 If the request was successful, the response looks like this:
{ “message”: “Lobby Created”, “serverCode”:”server code”}

Now using that serverCode the creator/admin of the server should be automatically joining the lobby by making an apiRequest to a websocket end (ws://localhost:3000/?serverCode=hAmiOg&age=19)
using the serverCode that was returned and the age the admin used while creating the server. 

This is one way to Enter lobby (which is the fourth screen among the inserted image)

Now another way to enter lobby is to when someone else created the server and they shared you the server Code. You click on the join server, and it displays overlays asking you for server code and your age. After you hit the Join Server just like in the third screen. You’ll be proceeding to lobby.


Now that we have discussed on two ways to enter lobby.

Let me give you on what happens when someone presses or joins the server.

It’ll only enter the lobby if there is a websocket message which has a certain format
{type: “online_players”, message: “number of online players/number of maximum players”}

Now as you can see in the lobby screen there is a loader spinning. Players will be in the lobby until a websocket message hits them

{ type: “game_starting”, message: “DidGeminiFoolYou”}

after the game_starting message is received. There will be another screen that displays the Loading game when another websocket message is received {type: “announcement”, message: “Loading the game”}

Now after the game starts there will be overlay in the chatsection where there will be displayed question that comes form websocket message

{ type: "answering_phase", message: { question: this.question, time: ` ${this.difficultySettings.answer_time} ` } }

It’ll display for like 3 seconds

After that overlay disappears and chat window will appear which will have few things like questions displayed on the top, player’s game name in the bottom. Everyone’s chat on the list. That screen gonna be entact until there is a voting_phase type of message in the websocket. When that round ends there is a websocket message of type: round_end
It displays another place screen. Now when the websocket receives any of the type of message. “kick_info”, “human_wins”, “gemini_wins” it is going to display the respective websocket message property in {type: “type of message as described above”, message: “the message each type has”}

The round repeats like this.

Untill there is an end game with the websocket message of

{ type: "game_over", message: "Thanks for playing. Create new server and play more"}
And when the game the websocket connection automatically disconnects and redirects to the landing page.

Now here is one optional thing that I can tell you to implement in the future. 
I can in the future tell you to listen to the websocket  that is type of summary. 

Finally whatever you code should be within the standard and best programming practices.






