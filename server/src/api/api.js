import {config} from '../../config/config.js';

export async function postHistory(token) {
    const response = await fetch(`${config.base_url}/history/${token}`,{
        method: 'POST',
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
  const response = await fetch(`${process.env.API_URL}/info/${token}`,{
      method: 'GET',
    })
    
  return response.json()
}
