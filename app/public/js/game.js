let urlParams = new URLSearchParams(window.location.search);

if (urlParams.get('join') != null) {
    document.getElementById("create").classList.add("hidden");
    document.getElementById("join").classList.add("hidden");

    addJoinElements();
} else if (urlParams.get('create') != null) {
    document.getElementById("create").classList.add("hidden");
    document.getElementById("join").classList.add("hidden");

    addCreateElements();
}

document.getElementById("create").addEventListener("click", () => {
    // remove "join" button from dom
    document.getElementById("create").classList.add("hidden");
    document.getElementById("join").classList.add("hidden");

    addCreateElements();
});

document.getElementById("join").addEventListener("click", () => {
    // remove "join" button from dom
    document.getElementById("create").classList.add("hidden");
    document.getElementById("join").classList.add("hidden");

    addJoinElements();
});

function addCreateElements() {
    let code = document.createElement("p");
    code.innerText = "DG425";
    code.classList.add("code");

    document.getElementsByClassName("buttons")[0].appendChild(code);

    let box = document.getElementsByClassName("box")[0];
    let ul = document.createElement("ul");
    ul.id = "playerList";
    let li = document.createElement("li");
    li.innerText = "Player 1";
    let li2 = document.createElement("li");
    li2.innerText = "Player 2";
    let li3 = document.createElement("li");
    li3.innerText = "Player 2";
    ul.appendChild(li);
    ul.appendChild(li2);
    ul.appendChild(li3);
    box.appendChild(ul);

    let startBtn = document.createElement("button");
    startBtn.innerText = "Start";
    startBtn.id = "start";
    box.appendChild(startBtn);

    startBtn.addEventListener("click", () => {
        startGame();
    });
}

function addJoinElements() {
    // let code = document.createElement("input");
    // code.type = "text";
    // code.id = "code";
    // code.classList.add("code");
    // document.getElementsByClassName("buttons")[0].appendChild(code);

    let form = document.createElement('form');
    form.method = "get";
    form.id = "digit-group";
    form.setAttribute('data-group-name', 'digits');
    form.setAttribute('data-autosubmit', 'true');
    form.setAttribute('autocomplete', 'off');

    for (let i = 1; i <= 5; i++) {
        let input = document.createElement('input');
        input.type = "text";
        input.id = `digit-${i}`;
        input.name = `digit-${i}`;
        input.className = "singleInput";
        input.maxLength = 1;

        if (urlParams.get('join') != null && urlParams.get('join').length == 5) {
            input.value = urlParams.get('join').charAt(i - 1);
        }

        form.appendChild(input);
    }

    document.getElementById('join-code').appendChild(form);

    document.getElementById('join-code').classList.add("join");

    // add join button below the form
    let joinButton = document.createElement('button');
    joinButton.type = "submit";
    joinButton.id = "join-btn";
    joinButton.textContent = "Join";
    joinButton.classList.add('btn');

    if (urlParams.get('join') != null && urlParams.get('join').length == 5) {
        joinButton.classList.remove('disabled');
        joinButton.disabled = false;
    } else {
        joinButton.classList.add('disabled');
        joinButton.disabled = true;
    }

    document.getElementsByClassName('box')[0].appendChild(joinButton);

    joinButton.addEventListener('click', () => {

    });

    const inputElements = [...document.querySelectorAll('#digit-group input')]

    inputElements.forEach((ele, index) => {
        ele.addEventListener('keydown', (e) => {
            if (e.keyCode === 8 && e.target.value === '') inputElements[Math.max(0, index - 1)].focus()
        })
        ele.addEventListener('input', (e) => {
            const [first, ...rest] = e.target.value
            e.target.value = first ?? ''
            const lastInputBox = index === inputElements.length - 1
            const didInsertContent = first !== undefined
            if (didInsertContent && !lastInputBox) {
                inputElements[index + 1].focus()
                inputElements[index + 1].value = rest.join('')
                inputElements[index + 1].dispatchEvent(new Event('input'))
            }

            let isValid = inputElements.every(input => { return input.value != ""; });

            if (isValid) {
                document.getElementById('digit-group').classList.add('valid');
                document.getElementById("join-btn").disabled = false;
                document.getElementById("join-btn").classList.remove('disabled');
            } else {
                document.getElementById('digit-group').classList.remove('valid');
                document.getElementById("join-btn").disabled = true;
                document.getElementById("join-btn").classList.add('disabled');
            }
        })
    })
}

function startGame(){
    clearPage();


}

function clearPage(){
    document.getElementsByClassName("box")[0].style.transform = "translateY(100px)";
    document.getElementsByTagName("footer")[0].style.transform = "translateY(100px)";
    document.getElementsByTagName("header")[0].style.transform = "translateY(100px)";

    document.getElementsByClassName("box")[0].style.opacity = "0";
    document.getElementsByTagName("footer")[0].style.opacity = "0";
    document.getElementsByTagName("header")[0].style.opacity = "0";

    setTimeout(() => {
        document.getElementsByClassName("box")[0].remove();
        document.getElementsByTagName("footer")[0].remove();
        document.getElementsByTagName("header")[0].remove();
    }, 1000);
}