import * as api from './api/api.js';


export async function getHistory(ws, token){
    try {
        ws.send(JSON.stringify({
            type: "history",
            history: await api.getHistory(token)
        }));
    } catch (error) {
        console.log(error);
    }
}