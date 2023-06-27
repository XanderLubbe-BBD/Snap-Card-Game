import {auth_config} from '../../config/auth_config.js';

export async function getInfo(token) {
    const response = await fetch(`${auth_config.base_urlAuth}/email`,{
        method: 'GET',
        headers: {
          'x-access-token': token,
        }
      })
      
    return response.json()
}

export async function verifyToken(token) {
    const response = await fetch(`${auth_config.base_urlAuth}/verify`,{
        method: 'GET',
        headers: {
          'x-access-token': token,
        }
      })
      
    return response.json()
}


