export function successResponse<T>(mensaje: string, data?: T) {
  return {
    success: true,
    mensaje,
    data: data ?? {}
  };
}

export function errorResponse(mensaje: string, errors: unknown[] = []) {
  return {
    success: false,
    mensaje,
    errors
  };
}
