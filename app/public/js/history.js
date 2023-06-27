window.onload = function (event) {
  const ws = new WebSocket(`wss://d2lgqlnck8vz6t.cloudfront.net/socket`);
  ws.addEventListener("open", () => {
    console.log("Connected to server");

    const msg = {
      type: "history",
      token: sessionStorage.getItem("token")
    }
    sendMessage(msg);
  });
};

ws.addEventListener('message', function (event) {
  let msg = JSON.parse(event.data);

  switch (msg.type) {
    case "history":
      console.log(msg.history);
      createHistoryTable(msg.history);
      break;
  }
})

function createHistoryTable(history) {
  let place = document.getElementById("historyTable");

  place.innerHTML = "";

  let tr = document.createElement("tr");
  let td = document.createElement("td");
  let ul = document.createElement("ul");
  ul.classList.add("name-list");
  for (let i = 0; i < history.players.length; i++) {
    let li = document.createElement("li");
    li.textContent = history.players[i];
    ul.appendChild(li);
  }

  td.appendChild(ul);
  tr.appendChild(td);
  place.appendChild(tr);
}