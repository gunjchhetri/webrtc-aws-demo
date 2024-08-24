export enum SocketEventType {
  INCOMING_CALL = "INCOMING_CALL",
  NEW_CONNECTION = "NEW_CONNECTION",
  AVAILABLE_CONNECTIONS = "AVAILABLE_CONNECTIONS",
  REGISTER = "REGISTER",
  MAKE_CALL = "MAKE_CALL",
}
export const getPayload = (
  message: Record<string, string>,
  type: SocketEventType
) => {
  return JSON.stringify({ payload: message, type });
};
