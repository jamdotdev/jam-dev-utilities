import Ajv from "ajv";

/**
 * Validates JSON data against a JSON schema.
 *
 * @param schema - A JSON schema as a string.
 * @param jsonData - JSON data as a string.
 * @returns An object with `valid` (boolean) and `errors` (array of error messages) properties.
 */
export const validateJsonSchema = (
  schema: string,
  jsonData: string
): { valid: boolean; errors: string[] } => {
  try {
    const ajv = new Ajv();
    const schemaObj = JSON.parse(schema);
    const dataObj = JSON.parse(jsonData);

    const validate = ajv.compile(schemaObj);
    const valid = validate(dataObj);

    if (valid) {
      return { valid: true, errors: [] };
    } else {
      const errors = validate.errors
        ? validate.errors.map((error) => `${error.dataPath} ${error.message}`)
        : [];
      return { valid: false, errors };
    }
  } catch (error) {
    if (error instanceof Error) {
      return { valid: false, errors: [error.message] };
    }
    throw error;
  }
};
