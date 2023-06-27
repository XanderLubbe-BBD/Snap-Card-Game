window.onload = function(event) {
    const msg = {
      type: "history",
      token: sessionStorage.getItem("token")
    }
  sendMessage(msg);
};
