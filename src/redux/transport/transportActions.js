import Transport from 'transport/models/Transport';

import {
  SET_TRANSPORT,
  DELETE_TRANSPORT,
  CREATE_TRANSPORT,
  UPDATE_QR,
  UPDATE_PDF,
} from './transportTypes';

// Fetch transport based on id of trip.
export const fetchTransport = (tripId) => {
  return async function (dispatch, getState) {
    const token = getState().auth.token;
    const userId = getState().auth.userId;
    const response = await fetch(
      `https://travellan-project.firebaseio.com/Trips/${userId}/${tripId}.json?auth=${token}`,
    );
    // Await json body of response.
    const resData = await response.json();
    // Take transportInfo stored in the trip and assign it to local variable for later logic.
    let transportInfo = resData.transportInfo;
    // Dispatch an action to reducer.
    dispatch({type: SET_TRANSPORT, tripId, transportInfo});
  };
};
/**Currently only for QR adding, can be reused to access particular tickets */
export const updateQR = (tripId, ticketId, qr) => {
  return async function (dispatch, getState) {
    const token = getState().auth.token;
    const userId = getState().auth.userId;
    const response = await fetch(
      `https://travellan-project.firebaseio.com/Trips/${userId}/${tripId}.json?auth=${token}`,
    );
    // Await json body of response.
    const resData = await response.json();
    // Take transportInfo stored in the trip and assign it to local variable for later logic.
    let transportInfo = resData.transportInfo;
    // Using transportInfo to identify Index of a ticket to access proper node
    let ticketKey = transportInfo.findIndex((item) => item.id === ticketId);
    // PATCH updates some of the keys for a defined path without replacing all of the data.
    await fetch(
      `https://travellan-project.firebaseio.com/Trips/${userId}/${tripId}/transportInfo/${ticketKey}.json?auth=${token}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qr,
        }),
      },
    );
    // Dispatch an action to reducer.
    await dispatch({type: UPDATE_QR, tripId, ticketId, qr});
  };
};

//used to update PATH/URI to pdf
export const updatePDF = (tripId, ticketId, pdfUri) => {
  return async function (dispatch, getState) {
    const token = getState().auth.token;
    const userId = getState().auth.userId;
    const response = await fetch(
      `https://travellan-project.firebaseio.com/Trips/${userId}/${tripId}.json?auth=${token}`,
    );
    // Await json body of response.
    const resData = await response.json();
    // Take transportInfo stored in the trip and assign it to local variable for later logic.
    let transportInfo = resData.transportInfo;
    // Using transportInfo to identify Index of a ticket to access proper node
    let ticketKey = transportInfo.findIndex((item) => item.id === ticketId);
    // PATCH updates some of the keys for a defined path without replacing all of the data.
    await fetch(
      `https://travellan-project.firebaseio.com/Trips/${userId}/${tripId}/transportInfo/${ticketKey}.json?auth=${token}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfUri,
        }),
      },
    );
    // Dispatch an action to reducer.
    dispatch({type: UPDATE_PDF, tripId, pdfUri});
  };
};

// Delete a ticket based on id of the ticket.
export const deleteTransport = (tripId, ticketId) => {
  return async function (dispatch, getState) {
    const token = getState().auth.token;
    const userId = getState().auth.userId;
    const response = await fetch(
      `https://travellan-project.firebaseio.com/Trips/${userId}/${tripId}.json?auth=${token}`,
    );
    // Await json body of response.
    const resData = await response.json();
    // Take transportInfo stored in the trip and assign it to local variable for later logic.
    let transportInfo = resData.transportInfo;
    // Change transportInfo to exclude the ticket we want to delete with the help of ticketId.
    transportInfo = transportInfo.filter((item) => !(item.id === ticketId));
    // PATCH updates some of the keys for a defined path without replacing all of the data.
    await fetch(
      `https://travellan-project.firebaseio.com/Trips/${userId}/${tripId}.json?auth=${token}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transportInfo,
        }),
      },
    );
    // Dispatch an action to reducer.
    dispatch({type: DELETE_TRANSPORT, tripId});
  };
};

// Create a ticket based on user input.
export const createTransport = (
  tripId,
  to,
  from,
  dateOfDeparture,
  placeOfDeparture,
  qr,
  pdfUri,
) => {
  const newTransport = new Transport(
    new Date().toString(), // DUMMY ID
    to,
    from,
    dateOfDeparture,
    placeOfDeparture,
    qr,
    pdfUri,
  );

  return async function (dispatch, getState) {
    const token = getState().auth.token;
    const userId = getState().auth.userId;
    const response = await fetch(
      `https://travellan-project.firebaseio.com/Trips/${userId}/${tripId}.json?auth=${token}`,
    );
    // Await json body of response.
    const resData = await response.json();
    // Take transportInfo stored in the trip and assign it to local variable for later logic.
    let transportInfo = resData.transportInfo;
    transportInfo === undefined
      ? (transportInfo = [newTransport])
      : (transportInfo = transportInfo.concat(newTransport));
    // PATCH updates some of the keys for a defined path without replacing all of the data.
    await fetch(
      `https://travellan-project.firebaseio.com/Trips/${userId}/${tripId}.json?auth=${token}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transportInfo,
        }),
      },
    );
    // Dispatch an action to reducer.
    dispatch({
      type: CREATE_TRANSPORT,
      tripId,
      transportInfo,
    });
  };
};
