import * as api from './api/api.js';


export async function registerUser(ws, token){
    try {
        const result = await api.sendInfo(token);
        if(result.status == "success"){
            ws.send(JSON.stringify({
                type: "register",
                status: true
            }))
        } else {
            ws.send(JSON.stringify({
                type: "register",
                status: false
            }))
        }
    } catch (error) {
        console.log(error);
    }
}