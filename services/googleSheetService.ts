import { Order, OrderStatus } from '../types';

// The structure of a row as it comes from the Google Sheet
type SheetRow = (string | number)[];

// The expected order of columns in the Google Sheet
const COLUMN_MAP = {
    id: 0,
    issueDate: 1,
    productDescription: 2,
    pieces: 3,
    fileNumber: 4,
    karigarName: 5,
    status: 6,
    billNumber: 7,
    imageUrl: 8,
};

/**
 * Transforms a raw row from Google Sheets into a structured Order object.
 * @param row - An array of values from a sheet row.
 * @returns An Order object.
 */
const transformRowToOrder = (row: SheetRow): Order => {
    return {
        id: String(row[COLUMN_MAP.id]),
        // Dates are parsed from ISO string format
        issueDate: new Date(String(row[COLUMN_MAP.issueDate])),
        productDescription: String(row[COLUMN_MAP.productDescription]),
        pieces: Number(row[COLUMN_MAP.pieces]),
        fileNumber: String(row[COLUMN_MAP.fileNumber]),
        karigarName: String(row[COLUMN_MAP.karigarName]),
        status: String(row[COLUMN_MAP.status]) as OrderStatus,
        billNumber: String(row[COLUMN_MAP.billNumber]),
        imageUrl: String(row[COLUMN_MAP.imageUrl]),
    };
};

/**
 * A generic fetch handler for the Google Apps Script API.
 * @param webAppUrl - The URL of the deployed Google Apps Script.
 * @param method - The HTTP method ('GET' or 'POST').
 * @param body - The request body for POST requests.
 * @returns The JSON response from the API.
 */
const fetchAPI = async (webAppUrl: string, method: 'GET' | 'POST', body?: object) => {
    const options: RequestInit = {
        method,
        redirect: 'follow', // Important for Google Apps Script
    };

    if (method === 'POST' && body) {
        options.body = JSON.stringify(body);
        options.headers = {
            'Content-Type': 'text/plain;charset=utf-8', // Apps Script requirement
        };
    }

    const response = await fetch(webAppUrl, options);

    if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const json = await response.json();
    if (json.status === 'error') {
        throw new Error(json.message);
    }
    return json;
};

/**
 * Fetches all orders from the Google Sheet.
 * @param webAppUrl - The URL of the deployed Google Apps Script.
 * @returns A promise that resolves to an array of orders.
 */
export const getOrders = async (webAppUrl: string): Promise<Order[]> => {
    const { data } = await fetchAPI(webAppUrl, 'GET');
    // Skip header row and filter out any completely empty rows
    return data.slice(1).filter((row: SheetRow) => row.some(cell => cell !== '')).map(transformRowToOrder);
};

/**
 * Adds a new order to the Google Sheet.
 * @param webAppUrl - The URL of the deployed Google Apps Script.
 * @param order - The order object to add.
 * @returns The newly created order.
 */
export const addOrder = async (webAppUrl: string, order: Omit<Order, 'id' | 'issueDate' | 'status'>): Promise<Order> => {
    const response = await fetchAPI(webAppUrl, 'POST', {
        action: 'add',
        payload: order,
    });
    return transformRowToOrder(response.data);
};

/**
 * Updates an existing order in the Google Sheet.
 * @param webAppUrl - The URL of the deployed Google Apps Script.
 * @param order - The full order object to update.
 * @returns The updated order.
 */
export const updateOrder = async (webAppUrl: string, order: Order): Promise<Order> => {
     const response = await fetchAPI(webAppUrl, 'POST', {
        action: 'update',
        payload: order,
    });
    return transformRowToOrder(response.data);
};

/**
 * Deletes an order from the Google Sheet.
 * @param webAppUrl - The URL of the deployed Google Apps Script.
 * @param orderId - The ID of the order to delete.
 */
export const deleteOrder = async (webAppUrl: string, orderId: string): Promise<void> => {
    await fetchAPI(webAppUrl, 'POST', {
        action: 'delete',
        payload: { id: orderId },
    });
};