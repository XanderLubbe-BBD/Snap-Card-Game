import {config} from '../../config/config.js';

export async function postHistory(game) {
  console.log(game);
    const response = await fetch(`http://apiserver:8082/gameResults`,{
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(game)
      })
      
    return response.json()
}

export async function getHistory(token) {
    const response = await fetch(`http://apiserver:8082/history/${token}`,{
        method: 'GET',
      })
      
    return response.json()
}

export async function getInfo(token) {
  const response = await fetch(`http://apiserver:8082/info/${token}`,{
      method: 'GET',
    })
    
  return response.json()
}

export async function sendInfo(token) {
  const response = await fetch(`http://apiserver:8082/register/${token}`,{
      method: 'GET',
    })
    
  return response.json()
}
