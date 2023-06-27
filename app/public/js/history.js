window.onload = function (event) {
  setTimeout(() => {
    const msg = {
      type: "history",
      token: sessionStorage.getItem("token")
    }
    sendMessage(msg);
  }, 2000);
};
