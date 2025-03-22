export const success = (data) => ({
    success: true,
    data,
});
export const err = (message) => ({
    success: false,
    error: message,
});
export const validationErr = (message, errors) => ({
    success: false,
    error: message,
    ...(errors && { validationErrors: errors }),
});
