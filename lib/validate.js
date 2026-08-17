export function validate(schema, data) {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.log(result.error);
    console.log(result.error.issues);
    return {
      success: false,
      errors: result.error.flatten(),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
