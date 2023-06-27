import {config} from '../../config/config.js';

export async function postHistory(game) {
    const response = await fetch(`${config.base_url}/gameResults`,{
        method: 'POST',
        body: JSON.stringify(game)
      })
      
    return response.json()
}

export async function getHistory(token) {
    const response = await fetch(`${config.base_url}/history/${token}`,{
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
