import { EXPAND_GENERIC_NAME } from "./constants"
import { FieldSchema } from "./types"

export function fieldNameToGeneric(name: string) {
  return `T${name}`
}

export function getGenericArgList(schema: FieldSchema[]): string[] {
  const jsonFields = schema
    .filter((field) => field.type === "json")
    .map((field) => fieldNameToGeneric(field.name))
    .sort()
  return jsonFields
}

export function getGenericArgStringForRecord(schema: FieldSchema[]): string {
  const argList = getGenericArgList(schema)
  if (argList.length === 0) return ""
  return `<${argList.map((name) => `${name}`).join(", ")}>`
}

// 【260219】原 getGenericArgStringWithDefault
// export function getGenericArgStringWithDefault(
//   schema: FieldSchema[],
//   opts: { includeExpand: boolean }
// ): string {
//   const argList = getGenericArgList(schema)

//   if (opts.includeExpand) {
//     argList.push(fieldNameToGeneric(EXPAND_GENERIC_NAME))
//   }

//   if (argList.length === 0) return ""
//   return `<${argList.map((name) => `${name} = unknown`).join(", ")}>`
// }

// 【260219】新 getGenericArgStringWithDefault 的效果
// 让 Texpand 靠前以保持 Response 类型的一致性
// 即【原 getGenericArgStringWithDefault】中 Texpand 是靠后的，造成如
// XxxxxResponse<Texpand = unknown>
// XxxxxResponse<Txxxxxxx = unknown, Texpand = unknown>
// 而【新 getGenericArgStringWithDefault】中 Texpand 是靠前的，效果如
// XxxxxResponse<Texpand = unknown>
// XxxxxResponse<Texpand = unknown, Txxxxxxx = unknown>
// 这样让 Texpand 永远在第一个更好

// 【260219】新 getGenericArgStringWithDefault
export function getGenericArgStringWithDefault(
  schema: FieldSchema[],
  opts: { includeExpand: boolean }
): string {
  const argList = getGenericArgList(schema)

  if (opts.includeExpand) {
    // argList.push(fieldNameToGeneric(EXPAND_GENERIC_NAME))
    // 关键改动：向前插入。 push 改为 unshift
    argList.unshift(fieldNameToGeneric(EXPAND_GENERIC_NAME))
  }

  if (argList.length === 0) return ""
  return `<${argList.map((name) => `${name} = unknown`).join(", ")}>`
}
