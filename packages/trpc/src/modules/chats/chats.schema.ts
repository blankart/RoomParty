
import zod from "zod";

export const sendSchema = zod.object({
    name: zod.string(),
    message: zod.string(),
    id: zod.string(),
    userId: zod.string().optional(),
    color: zod.string(),
})