let BASE_URL = "";

function get_res() {
    if (testLoggedin(null)) {
        fetch(BASE_URL + "/team/", {
            method: "GET",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        }).then(response => response.json()).then((data)=>{
            let rights = getRights();
        if (rights.indexOf('bierprijs') !== -1) {
            
        }
        let modal = document.createElement("div");
            modal.innerHTML = `<h3>Nieuwe transactie</h3>`;
            let html = `<select id="team">`;
            let teams = data["teams"];
            console.log(teams);
            for (let i of teams ) {
                console.log(i);
                html += `<option value="${i.id}">${i.name}</option>`;
            }
            html += "</select>";

            modal.innerHTML += html;
            modal.innerHTML += `<input type="number" id="amount"></input>`;
            modal.innerHTML += `<button onclick="ne_act()">Maak transactie aan</button>`;

            document.getElementById("welcome").innerHTML = modal.innerHTML;
        });
        
    }
}

function ne_act() {
    if (testLoggedin(null)) {
        fetch(BASE_URL + "/transaction/", {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: document.getElementById('team').value,
                amount: document.getElementById('amount').value,
            })
        }).then(response => response.json()).then(a => {
            if (a.success === true) {
                get_res();
            }
        });
    }
}

function logout() {
    if (testLoggedin(null)) {
        fetch(BASE_URL + "/user/logout", {
            method: "GET",
            credentials: 'include'
        });
    }
    document.getElementById("login").style.display = "block";
    document.getElementById("content").style.display = "none";
    document.getElementById("content2").style.display = "none";
    document.getElementById("vertegenoordiger").style.display = "none";
}

function getCookie(cookieName) {
    let name = cookieName + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if ((c.indexOf(name)) == 0) {
            return c.substr(name.length);
        }

    }
    return null;
}

function getRights(cookieName) {
    let rights_cookie = getCookie("rights");
    return rights_cookie;
}

function testLoggedin(event) {
    if (getCookie('loggedin') === "1") {
        document.getElementById("login").style.display = "none";
        document.getElementById("content").style.display = "block";
        return true;
    }
    document.getElementById("login").style.display = "block";
    document.getElementById("content").style.display = "none";
    return false;
}

window.addEventListener("focus", testLoggedin, false);

document.onload = init();

function init() {
    if (testLoggedin(null)) {
        get_res();
    }
}