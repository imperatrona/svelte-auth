import type { VineObject } from "@vinejs/vine";
import vine, { errors } from "@vinejs/vine";
import type { InputError } from "./errors";

type ValidationResult<Type> = {
  data: Type;
  errors: InputError[];
};

export async function validateFormData<Type>(
  form: FormData,
  schema: VineObject<any, Type, any>
): Promise<ValidationResult<Type | null>> {
  try {
    const result = await vine.validate({
      schema,
      data: Object.fromEntries(form.entries()),
    });

    return { data: result, errors: [] };
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return {
        data: null,
        errors: error.messages as InputError[],
      };
    }
    throw error;
  }
}
