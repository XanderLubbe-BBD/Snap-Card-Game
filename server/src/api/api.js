import {config} from '../../config/config.js';

export async function postHistory(token) {
    const response = await fetch(`${config.base_url}/history/${token}`,{
        method: 'POST',
        headers: {
          'x-access-token': token,
        }
      })
      
    return response.json()
}

export async function getHistory(token) {
    const response = await fetch(`${config.base_url}/history/${token}`,{
        method: 'GET',
        headers: {
          'x-access-token': token,
        }
      })
      
    return response.json()
}


