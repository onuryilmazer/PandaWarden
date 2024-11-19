import { ConnectionError, HttpError, LoginExpiredError, RateLimitingError } from "./ErrorClasses";

const BASE_URL = "/user";

async function getDetails(token) {
    const header = await fetch(`${BASE_URL}/details`, {
        method: "GET",
        headers: {"Authorization": `Bearer ${token}`},
    }).catch(() => new ConnectionError());

    if (header instanceof ConnectionError) throw header;

    const body = await header.json().catch(() => null);
    
    if (header.status == 401) throw new LoginExpiredError();
    else if (header.status === 429) throw new RateLimitingError();
    else if (!header.ok) throw new HttpError(body?.message ?? `Could not retrieve user details. \n ${header.statusText}`, header.status);

    return body;
}

async function getMonitoringRequestsOfUser(token) {
    const header = await fetch(`${BASE_URL}/monitoringRequests`, {
        method: "GET",
        headers: {"Authorization": `Bearer ${token}`},
    }).catch(() => new ConnectionError());

    if (header instanceof ConnectionError) throw header;

    const body = await header.json().catch(() => null);
    
    if (header.status == 401) throw new LoginExpiredError();
    else if (header.status === 429) throw new RateLimitingError();
    else if (!header.ok) throw new HttpError(body?.message ?? `Could not retrieve monitoring requests. \n ${header.statusText}`, header.status);

    return body;
}

async function getMonitoringRequestOfUser(token, requestId) {
    const header = await fetch(`${BASE_URL}/monitoringRequests/${requestId}`, {
        method: "GET",
        headers: {"Authorization": `Bearer ${token}`},
    }).catch(() => new ConnectionError());

    if (header instanceof ConnectionError) throw header;

    const body = await header.json().catch(() => null);
    
    if (header.status == 401) throw new LoginExpiredError();
    else if (header.status === 429) throw new RateLimitingError();
    else if (!header.ok) throw new HttpError(body?.message ?? `Could not retrieve monitoring request. \n ${header.statusText}`, header.status);

    return body;
}

async function toggleMonitoringRequestActive(token, requestId) {
    const header = await fetch(`${BASE_URL}/monitoringRequests/${requestId}/toggleActiveness`, {
        method: "PATCH",
        headers: {"Authorization": `Bearer ${token}`},
    }).catch(() => new ConnectionError());

    if (header instanceof ConnectionError) throw header;

    const body = await header.json().catch(() => null);
    
    if (header.status == 401) throw new LoginExpiredError();
    else if (header.status === 429) throw new RateLimitingError();
    else if (!header.ok) throw new HttpError(body?.message ?? `Could not toggle monitoring request activeness. \n ${header.statusText}`, header.status);

    return body;
}

async function deleteMonitoringRequest(token, requestId) {
    const header = await fetch(`${BASE_URL}/monitoringRequests/${requestId}`, {
        method: "DELETE",
        headers: {"Authorization": `Bearer ${token}`},
    }).catch(() => new ConnectionError());

    if (header instanceof ConnectionError) throw header;

    const body = await header.json().catch(() => null);

    if (header.status == 401) throw new LoginExpiredError();
    else if (header.status === 429) throw new RateLimitingError();
    else if (!header.ok) throw new HttpError(body?.message ?? `Could not delete monitoring request. \n ${header.statusText}`, header.status);

    return body;
}

async function createMonitoringRequest(token, {keywords, sourceIds, repeatIntervalSeconds}) {
    const header = await fetch(`${BASE_URL}/monitoringRequests`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({keywords, sourceIds, repeatIntervalSeconds})
    }).catch(() => new ConnectionError());

    if (header instanceof ConnectionError) throw header;

    const body = await header.json().catch(() => null);

    if (header.status == 401) throw new LoginExpiredError();
    else if (header.status === 429) throw new RateLimitingError();
    else if (!header.ok) throw new HttpError(body?.message ?? `Could not create monitoring request. \n ${header.statusText}`, header.status);

    return body;
}

export { getDetails, getMonitoringRequestsOfUser, getMonitoringRequestOfUser, toggleMonitoringRequestActive, deleteMonitoringRequest, createMonitoringRequest };