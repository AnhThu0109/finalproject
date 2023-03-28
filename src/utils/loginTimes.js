import { LOGINTIMES } from './API';

//Add login times for user whenever new user added
async function addLoginTimes(id) {
    const userId = {
        "userId": id
    }
  return fetch(LOGINTIMES, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userId),
  })
  .then(response => {return response;})
  .catch(error => {
    console.error(error);
    throw error;
  });
}

//Get all login times of users
async function getAllLoginTimes() {
  return fetch(LOGINTIMES)
  .then(response => {return response;})
  .catch(error => {
    console.error(error);
    throw error;
  });
}

//Get login times by user ID
async function getLoginTimesByUserId(id) {
    return fetch(`${LOGINTIMES}${id}`)
    .then(response => {return response;})
    .catch(error => {
      console.error(error);
      throw error;
    });
  }

//Update login times whenever user login to system (new = old + 1)
async function updateLoginTimes(id) {
    const body = {
        "userId": "642299c4af441679234af417",
        "logintime": 1
    }
    return fetch(LOGINTIMES, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      .then(response => {return response;})
      .catch(error => {
        console.error(error);
        throw error;
      });
}

export {addLoginTimes, getAllLoginTimes, getLoginTimesByUserId};