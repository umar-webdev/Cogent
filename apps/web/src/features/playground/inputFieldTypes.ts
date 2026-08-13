export const INPUT_FIELD_TYPES = [
  { id: "text", label: "Text", description: "Plain text — you define rules in a Validator block." },
  {
    id: "email",
    label: "Email",
    description: "Email keyboard on mobile; validation is your Validator code.",
  },
  {
    id: "password",
    label: "Password",
    description: "Masked input; add a Validator for length, symbols, etc.",
  },
  {
    id: "tel",
    label: "Phone",
    description: "Telephone input; validate digits/format in your Validator.",
  },
  {
    id: "number",
    label: "Number",
    description: "Numeric input; range checks go in your Validator.",
  },
  { id: "url", label: "URL", description: "URL input; pattern checks go in your Validator." },
] as const;

export type InputFieldType = (typeof INPUT_FIELD_TYPES)[number]["id"];

const FIELD_TYPE_SET = new Set<string>(INPUT_FIELD_TYPES.map((type) => type.id));

export function normalizeInputFieldType(value?: string): InputFieldType {
  if (value && FIELD_TYPE_SET.has(value)) {
    return value as InputFieldType;
  }
  return "text";
}

export function inputFieldTypeLabel(type: InputFieldType): string {
  return INPUT_FIELD_TYPES.find((entry) => entry.id === type)?.label ?? "Text";
}
